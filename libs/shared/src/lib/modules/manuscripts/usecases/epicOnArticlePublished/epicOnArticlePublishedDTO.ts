export interface EpicFooBar {
  foo?: string;
  bar: number;
}

export interface EpicOnArticlePublishedDTO {
  epicFoo?: string;
  epicFooBar: EpicFooBar;
}
