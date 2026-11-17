const express = require("express");
const prisma = require("../lib/prisma");
const getStripeClient = require("../lib/stripe");
const { requireAuth } = require("../lib/auth");

const router = express.Router();

const DISCOUNT_PERCENT = 20;
const configuredClientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const CLIENT_URL = /^https?:\/\//i.test(configuredClientUrl)
  ? configuredClientUrl
  : `https://${configuredClientUrl}`;
const normalizedClientUrl = CLIENT_URL.replace(/\/+$/, "");

router.post("/session", requireAuth, async (req, res) => {
  try {
    const { courseId, inviteCode } = req.body || {};
    const userId = req.authUser.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message: "Checkout is not configured",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, referralCode: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true, slug: true },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "This course is free and does not require checkout",
      });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    let finalPrice = course.price;
    let discountApplied = false;
    let referrerId = null;

    if (inviteCode) {
      if (inviteCode === user.referralCode) {
        return res.status(400).json({
          success: false,
          message: "You cannot use your own referral code",
        });
      }

      const referrer = await prisma.user.findUnique({
        where: { referralCode: inviteCode },
        select: { id: true },
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid invite code",
        });
      }

      referrerId = referrer.id;
      finalPrice = course.price * (1 - DISCOUNT_PERCENT / 100);
      discountApplied = true;
    }

    const unitAmount = Math.round(finalPrice * 100);

    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: course.title,
              description: discountApplied
                ? `${DISCOUNT_PERCENT}% referral discount applied`
                : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        courseId: course.id,
        referrerId: referrerId || "",
        discountApplied: String(discountApplied),
        originalPrice: String(course.price),
        finalPrice: String(finalPrice),
      },
      success_url: `${normalizedClientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${normalizedClientUrl}/courses/${course.slug}`,
    });

    return res.status(200).json({
      success: true,
      data: {
        sessionUrl: session.url,
        sessionId: session.id,
        originalPrice: course.price,
        finalPrice,
        discountApplied,
      },
    });
  } catch (error) {
    console.error("[POST /api/checkout/session] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
    });
  }
});

module.exports = router;
