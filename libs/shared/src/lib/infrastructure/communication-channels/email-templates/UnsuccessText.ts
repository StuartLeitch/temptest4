const textStyle = `
  color:{{unsuccessColor}};
`;

// border:1px solid #333333;
// border-color:{{ctaColor}};
// border-radius:0px;
// border-width:1px;
// color:#ffffff;
// display:inline-block;
// font-family:arial,helvetica,sans-serif;
// font-size:16px;
// font-weight:normal;
// letter-spacing:0px;
// line-height:16px;
// padding:12px 18px 12px 18px;
// text-align:center;
// text-decoration:none

export class UnsuccessTextTemplate {
  static build(text: string): string {
    return `
    <span
      style="${textStyle}"
      align="center"
    >
      ${text}
    </span>
    `;
  }
}
