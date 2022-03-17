export class ReasonsListTemplate {
  static build(reasons: string[]): string {
    return '<ul>' + reasons.reduce((acc, reason) => {
      acc += `<li>${reason}</li>`;
      return acc;
    }, '') + '</ul>';
  }
}
