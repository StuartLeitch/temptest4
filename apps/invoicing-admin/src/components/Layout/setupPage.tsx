/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withPageConfig } from './withPageConfig'

export const setupPage = (startupConfig) =>
    (Component) => {
      class PageSetupWrap extends React.Component<Props> {
        static propTypes = {
          pageConfig: PropTypes.object
        }

        prevConfig: Pick<any, "pageTitle" | "pageDescription" | "pageKeywords">;

        componentDidMount() {
          this.prevConfig = _.pick(this.props.pageConfig,
            ['pageTitle', 'pageDescription', 'pageKeywords']);
          this.props.pageConfig.changeMeta(startupConfig);
        }

        componentWillUnmount() {
          this.props.pageConfig.changeMeta(this.prevConfig);
        }

        render() {
          return (
            <Component { ...this.props } />
          )
        }
      }

      return withPageConfig(PageSetupWrap);
    };

interface Props {
  pageConfig: {
    pageTitle?: string;
    pageDescription?: string;
    pageKeywords?: string;
    changeMeta?(config): void;
  };
}
