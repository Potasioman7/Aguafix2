import { CreateReportDto } from '../dto/create-report.dto';

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: '#2e7d32' },
  medium: { label: 'Media', color: '#f9a825' },
  high: { label: 'Alta', color: '#c62828' },
};

/**
 * Genera el HTML del correo de aviso para la cuadrilla de mantenimiento
 * a partir de los datos del reporte de fuga.
 */
export function generateReportTemplate(dto: CreateReportDto, photoUrl: string): string {
  const severityInfo =
    SEVERITY_LABELS[dto.severity] ?? { label: dto.severity, color: '#455a64' };

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Nuevo reporte de fuga de agua</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f2f4f6; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f4f6; padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color:#0277bd; padding:20px 24px;">
                  <h1 style="color:#ffffff; font-size:20px; margin:0;">Nuevo reporte de fuga de agua</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <p style="font-size:14px; color:#333333; margin-top:0;">
                    Se ha registrado un nuevo reporte ciudadano en la via publica. A continuacion los detalles:
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:12px;">
                    <tr>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; background-color:#fafafa; font-weight:bold; font-size:13px; color:#555555; width:160px;">
                        Direccion
                      </td>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; font-size:13px; color:#333333;">
                        ${dto.address}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; background-color:#fafafa; font-weight:bold; font-size:13px; color:#555555;">
                        Descripcion
                      </td>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; font-size:13px; color:#333333;">
                        ${dto.description}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; background-color:#fafafa; font-weight:bold; font-size:13px; color:#555555;">
                        Severidad
                      </td>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; font-size:13px;">
                        <span style="display:inline-block; padding:2px 10px; border-radius:12px; background-color:${severityInfo.color}; color:#ffffff; font-size:12px; font-weight:bold;">
                          ${severityInfo.label}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; background-color:#fafafa; font-weight:bold; font-size:13px; color:#555555;">
                        Telefono de contacto
                      </td>
                      <td style="padding:10px 12px; border:1px solid #e0e0e0; font-size:13px; color:#333333;">
                        ${dto.reporterPhone}
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    <tr>
                      <td style="padding:8px 0 4px 0; font-weight:bold; font-size:13px; color:#555555;">
                        Foto de la fuga
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:4px 0;">
                        <img
                          src="${photoUrl}"
                          alt="Foto de la fuga de agua reportada"
                          width="552"
                          style="display:block; width:100%; max-width:552px; height:auto; border-radius:6px; border:1px solid #e0e0e0;"
                        />
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:12px; color:#888888; margin-top:24px;">
                    Por favor coordinar la atencion de este reporte segun el nivel de severidad indicado.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f5f5f5; padding:14px 24px; text-align:center;">
                  <p style="font-size:11px; color:#999999; margin:0;">
                    Este es un correo automatico generado por el sistema municipal de reportes de fugas de agua.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
