const listStyle = `
font-family: 'Nunito', sans-serif;
font-weight: 400;
font-size: 14px;
line-height: 19px;
`;
export class ReasonsListTemplate {
  static build(reasons: string[]): string {
    return (
      '<ul>' +
      reasons.reduce((acc, reason) => {
        acc += `<li style="${listStyle}">${reason}</li>`;
        return acc;
      }, '') +
      '</ul>'
    );
  }
}
