import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export enum EmailType {
  VERIFY = "verify",
  RESET = "reset",
}

type SendEmailParams = {
  email: string;
  emailType: EmailType;
  userId: string;
};

function emailTemplate({
  title,
  description,
  actionText,
  actionLink,
}: {
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f4f5; padding:40px;">
    <div style="max-width:520px;margin:auto;background:white;padding:24px;border-radius:12px;border:1px solid #e4e4e7;">
      
      <h2 style="margin:0 0 16px 0;color:#18181b;">${title}</h2>
      
      <p style="color:#3f3f46;line-height:1.6;">
        ${description}
      </p>

      <a href="${actionLink}" 
         style="
          display:inline-block;
          margin-top:20px;
          padding:12px 18px;
          background:#7c3aed;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
         ">
        ${actionText}
      </a>

      <p style="margin-top:24px;font-size:12px;color:#71717a;">
        Kalau tombol tidak berfungsi, copy link ini:
      </p>

      <p style="font-size:12px;color:#52525b;word-break:break-all;">
        ${actionLink}
      </p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e4e4e7;" />

      <p style="font-size:12px;color:#a1a1aa;">
        Email ini dikirim otomatis oleh sistem Goresan.
      </p>

    </div>
  </div>
  `;
}

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: SendEmailParams) => {
  try {
    const hashedToken = await bcrypt.hash(userId.toString(), 10);

    if (emailType === EmailType.VERIFY) {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      });
    }

    const baseUrl = process.env.DOMAIN;

    const isVerify = emailType === EmailType.VERIFY;

    const actionLink = `${baseUrl}/verifyemail?token=${hashedToken}`;

    const html = emailTemplate({
      title: isVerify
        ? "Verifikasi Email Kamu"
        : "Reset Password Akun Kamu",
      description: isVerify
        ? "Terima kasih sudah daftar di Goresan. Untuk mulai menggunakan akun kamu, silakan verifikasi email ini terlebih dahulu."
        : "Kami menerima permintaan reset password. Klik tombol di bawah untuk membuat password baru.",
      actionText: isVerify ? "Verifikasi Sekarang" : "Reset Password",
      actionLink,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Goresan" <${process.env.NODE_MAILER_FROM_MAIL}>`,
      to: email,
      subject: isVerify
        ? "Verifikasi Email Goresan"
        : "Reset Password Goresan",
      html,
    };

    return await transport.sendMail(mailOptions);
  } catch (error: any) {
    throw new Error(error.message);
  }
};