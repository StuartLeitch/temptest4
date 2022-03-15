const textStyle = `
  color:{{unsuccessColor}};
  font-family: 'Nunito', sans-serif;
`;
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
