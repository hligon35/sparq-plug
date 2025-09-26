export interface SignatureInput {
  name: string;
  role: string;
  brandColor: string; // hex
  logoUrl?: string;
  website?: string;
}

export class SignatureTemplateService {
  generate(input: SignatureInput): { html: string; text: string } {
    const safeLogo = input.logoUrl ? `<img alt="Logo" src="${encodeURIComponent(input.logoUrl)}" style="height:32px;"/>` : '';
    const html = `
      <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#333;">
        <tr>
          <td style="padding-right:12px;">${safeLogo}</td>
          <td>
            <div style="font-weight:700;color:${input.brandColor}">${input.name}</div>
            <div style="opacity:.8">${input.role}</div>
            ${input.website ? `<div><a href="${input.website}" style="color:${input.brandColor}">${input.website}</a></div>` : ''}
          </td>
        </tr>
      </table>
    `;
    const text = `${input.name} | ${input.role}${input.website ? ` | ${input.website}` : ''}`;
    return { html, text };
  }
}
