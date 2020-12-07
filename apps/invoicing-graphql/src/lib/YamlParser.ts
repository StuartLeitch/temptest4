import YAML from 'yaml';

export class YamlParser {
  private readonly data: string;
  private parsedContent: unknown;

  constructor(data: string) {
    this.data = data;
    this.parseData();
  }

  private parseData() {
    this.parsedContent = YAML.parse(this.data);
  }

  public getData(): string {
    return this.data;
  }

  public getParsedContent(): any {
    return this.parsedContent;
  }
}
