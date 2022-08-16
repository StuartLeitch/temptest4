const buttonStyles = `
  background-color:{{ctaColor}};
  border:1px solid #333333;
  border-color:{{ctaColor}};
  border-radius:0px;
  border-width:1px;
  color:#ffffff;
  display:inline-block;
  font-family:arial,helvetica,sans-serif;
  font-size:16px;
  font-weight:normal;
  letter-spacing:0px;
  line-height:16px;
  padding:12px 18px 12px 18px;
  text-align:center;
  text-decoration:none
`;

const buttonCellStyles = `
  border-radius:6px;
  font-size:16px;
  text-align:center;
  background-color:inherit
`;

export class ButtonLinkTemplate {
  static build(label: string, link: string) {
    return `
    <table
      data-role="module-button"
      style="table-layout:fixed"
      data-type="button"
      cellPadding="0"
      cellSpacing="0"
      class="module"
      role="module"
      width="100%"
      border="0"
    >
      <tbody>
        <tr>
          <td
            style="padding:0px 0px 30px 0px;background-color:#FFFFFF"
            bgcolor="#FFFFFF"
            class="outer-td"
            align="center"
          >
            <table
              class="button-css__deep-table___2OZyb wrapper-mobile"
              style="text-align:center"
              cellPadding="0"
              cellSpacing="0"
              border="0"
            >
              <tbody>
                <tr>
                  <td
                    style="${buttonCellStyles}"
                    bgcolor="{{ctaColor}}"
                    class="inner-td"
                    align="center"
                  >
                    <a
                      style="${buttonStyles}"
                      target="_blank"
                      href="${link}"
                    >
                      ${label}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    `;
  }
}
