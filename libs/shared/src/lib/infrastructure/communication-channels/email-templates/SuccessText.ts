const textStyle = `
  color:{{ctaColor}};
  font-family: 'Nunito', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;
`;

export class SuccessTextTemplate {
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
