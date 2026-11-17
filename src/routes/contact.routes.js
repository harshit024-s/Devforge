const express = require("express");
const nodemailer = require("nodemailer");
const prisma = require("../lib/prisma");
const { z } = require("zod");
const { requireAuth, requireAdmin } = require("../lib/auth");

const router = express.Router();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be under 15 digits")
    .regex(/^[+]?[\d\s-]+$/, "Please enter a valid mobile number"),
  issue: z
    .string()
    .min(10, "Issue description must be at least 10 characters")
    .max(2000, "Issue description must be under 2000 characters"),
});

// Configure email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASSWORD,
    },
  });
}

// POST /api/contact — submit a contact form message
router.post("/", async (req, res) => {
  try {
    const result = contactSchema.safeParse(req.body);

    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const { name, email, mobile, issue } = result.data;

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, mobile, issue },
    });

    // Send notification email to DevForge support
    try {
      const transporter = createTransporter();
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeMobile = escapeHtml(mobile);
      const safeIssue = escapeHtml(issue).replace(/\r?\n/g, "<br>");

      const mailOptions = {
        from: `"DevForge Contact" <${process.env.CONTACT_EMAIL}>`,
        to: process.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `[DevForge Contact] New message from ${name.replace(/[\r\n]+/g, " ")}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
            <div style="background: linear-gradient(135deg, #263cf2, #7c3aed); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: -0.5px;">📩 New Contact Message</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">Submitted via DevForge Contact Form</p>
            </div>
            <div style="padding: 32px 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px; width: 120px; vertical-align: top;">Name</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 15px; font-weight: 600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px; vertical-align: top;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 15px;"><a href="mailto:${safeEmail}" style="color: #818cf8; text-decoration: none;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px; vertical-align: top;">Mobile</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 15px;">${safeMobile}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #a1a1aa; font-size: 13px; vertical-align: top;">Issue</td>
                  <td style="padding: 12px 0; color: #fafafa; font-size: 15px; line-height: 1.6;">${safeIssue}</td>
                </tr>
              </table>
            </div>
            <div style="padding: 20px 24px; background: #18181b; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">Message ID: ${contactMessage.id}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #71717a;">⏱ Please respond within 24 hours</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Contact email sent for message ${contactMessage.id}`);
    } catch (emailErr) {
      // Log the email failure but don't fail the request — the message is saved in DB
      console.error("Failed to send contact notification email:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message:
        "Thank you for reaching out! We've received your message and will respond within 24 hours.",
      data: {
        id: contactMessage.id,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

// GET /api/contact — admin endpoint to list all contact messages
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Fetch contact messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
});

// PATCH /api/contact/:id/respond — toggle responded status
router.patch("/:id/respond", requireAuth, requireAdmin, async (req, res) => {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const updated = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isResponded: !message.isResponded },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Toggle respond error:", error);
    return res.status(500).json({ success: false, message: "Failed to update message." });
  }
});

// DELETE /api/contact/:id — delete a contact message
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Delete contact message error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete message." });
  }
});

module.exports = router;
