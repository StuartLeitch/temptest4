const paragraphStyles = `
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 7px 16px;

  background-color:#F5F5F5;

  border: 1px solid #E0E0E0;
  box-sizing: border-box;
  border-radius: 4px;

  font-family: 'Nunito', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;

  letter-spacing: 0px;

  padding: 12px 18px 12px 18px;
  text-align: left;
  text-decoration: none;
`;

export class SectionTemplate {
  static build(text: string): string {
    return `
    <p
      style="${paragraphStyles}"
      class="inner-paragraph"
      align="center"
    >
    ${text}
    </p>
    `;
  }
}
