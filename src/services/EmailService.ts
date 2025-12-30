import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import config from '../config/config';

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Para desarrollo
        }
    });

    private static resend = new Resend(config.RESEND_API_KEY);

    /**
     * Envía email de reset de contraseña
     * @param to Email destino
     * @param token Token de reset
     * @param username Nombre de usuario
     */
    static async sendPasswordResetEmail(to: string, token: string, username: string) {
        const resetUrl = `${config.FRONTEND_URL}/auth/reset-password?token=${token}`;

        const mailOptions = {
            from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
            to: to,
            subject: 'Recuperación de Contraseña - Hybrid',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 10px;
                            padding: 30px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            color: #2c3e50;
                            margin-bottom: 30px;
                        }
                        .content {
                            background-color: white;
                            padding: 25px;
                            border-radius: 5px;
                            margin-bottom: 20px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background-color: #3498db;
                            color: white !important;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .button:hover {
                            background-color: #2980b9;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 3px;
                        }
                        .footer {
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            margin-top: 30px;
                        }
                        .token-box {
                            background-color: #f4f4f4;
                            border: 1px dashed #ccc;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                            font-family: monospace;
                            word-break: break-all;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Recuperación de Contraseña</h1>
                        </div>
                        
                        <div class="content">
                            <p>Hola <strong>${username}</strong>,</p>
                            
                            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Hybrid.</p>
                            
                            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                            </div>
                            
                            <p>O copia y pega el siguiente enlace en tu navegador:</p>
                            <div class="token-box">
                                ${resetUrl}
                            </div>
                            
                            <div class="warning">
                                <strong>⏰ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>.
                            </div>
                            
                            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no será modificada.</p>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                            <p>&copy; ${new Date().getFullYear()} Hybrid. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Recuperación de Contraseña - Hybrid
                
                Hola ${username},
                
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                
                Para crear una nueva contraseña, visita el siguiente enlace:
                ${resetUrl}
                
                Este enlace expirará en 1 hora.
                
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                
                © ${new Date().getFullYear()} Hybrid. Todos los derechos reservados.
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent via SMTP:', info.messageId);
            return info;
        } catch (smtpError) {
            console.error('Error sending email via SMTP:', smtpError);
            console.log('Attempting to send via Resend as fallback...');
            
            try {
                const resendInfo = await this.resend.emails.send({
                    from: `Hybrid <onboarding@resend.dev>`,
                    to: to,
                    subject: 'Recuperación de Contraseña - Hybrid',
                    html: mailOptions.html,
                    text: mailOptions.text
                });
                
                if (resendInfo.data) {
                    console.log('Password reset email sent via Resend:', resendInfo.data.id);
                    return resendInfo;
                } else {
                    throw new Error(resendInfo.error?.message || 'Resend failed without error details');
                }
            } catch (resendError) {
                console.error('Error sending email via Resend:', resendError);
                throw new Error('Failed to send email via both SMTP and Resend');
            }
        }
    }

    /**
     * Verifica la conexión con el servidor SMTP
     */
    static async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('Email server is ready to send messages');
            return true;
        } catch (error) {
            console.error('Email server connection failed:', error);
            return false;
        }
    }

    /**
     * Envía un email genérico
     * @param to Email destino
     * @param subject Asunto
     * @param html Contenido HTML
     * @param text Contenido texto plano
     */
    static async sendEmail(to: string, subject: string, html: string, text?: string) {
        const mailOptions = {
            from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
            to: to,
            subject: subject,
            html: html,
            text: text || html.replace(/<[^>]*>/g, '') // Elimina HTML si no hay texto
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent via SMTP:', info.messageId);
            return info;
        } catch (smtpError) {
            console.error('Error sending email via SMTP:', smtpError);
            console.log('Attempting to send via Resend as fallback...');
            
            try {
                const resendInfo = await this.resend.emails.send({
                    from: `${config.EMAIL_FROM_NAME} <${config.EMAIL_FROM}>`,
                    to: to,
                    subject: subject,
                    html: html,
                    text: text
                });
                
                if (resendInfo.data) {
                    console.log('Email sent via Resend:', resendInfo.data.id);
                    return resendInfo;
                } else {
                    throw new Error(resendInfo.error?.message || 'Resend failed without error details');
                }
            } catch (resendError) {
                console.error('Error sending email via Resend:', resendError);
                throw new Error('Failed to send email via both SMTP and Resend');
            }
        }
    }
}
