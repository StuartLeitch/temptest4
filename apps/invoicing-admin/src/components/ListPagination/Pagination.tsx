import React, { Component, Fragment } from 'react';
// import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

const range = (from: number, to: number, step = 1) => {
  let i = from;
  const _range = [];

  while (i <= to) {
    _range.push(i);
    i += step;
  }

  return _range;
};

export class ListPagination extends Component {
  static propTypes = {
    onPageChanged: PropTypes.func,
    totalRecords: PropTypes.number,
    pageLimit: PropTypes.number,
    pageNeighbours: PropTypes.number,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number
  };

  totalRecords: number;
  pageLimit: number;
  pageNeighbours: number;
  totalPages: number;

  constructor(props: any) {
    super(props);

    const {
      totalRecords = null,
      pageLimit = 30,
      pageNeighbours = 0,
      currentPage: currentPage = 1
    } = props;

    this.pageLimit = typeof pageLimit === 'number' ? pageLimit : 30;
    this.totalRecords = typeof totalRecords === 'number' ? totalRecords : 0;

    this.pageNeighbours =
      typeof pageNeighbours === 'number'
        ? Math.max(0, Math.min(pageNeighbours, 2))
        : 0;

    this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);

    this.state = { currentPage };
  }

  componentDidMount() {
    // this.gotoPage(1);
  }

  gotoPage = page => {
    const { onPageChanged = f => f } = this.props;

    const currentPage = Math.max(0, Math.min(page, this.totalPages));

    const paginationData = {
      currentPage,
      totalPages: this.totalPages,
      pageLimit: this.pageLimit,
      totalRecords: this.totalRecords
    };

    // this.setState({ currentPage }, () => onPageChanged(paginationData, this));
    onPageChanged(paginationData, this);
  };

  handleClick = (page, evt) => {
    evt.preventDefault();
    this.gotoPage(page);
  };

  handleMoveLeft = evt => {
    evt.preventDefault();
    this.gotoPage(this.state.currentPage - this.pageNeighbours * 2 - 1);
  };

  handleMoveRight = evt => {
    evt.preventDefault();
    this.gotoPage(this.state.currentPage + this.pageNeighbours * 2 + 1);
  };

  fetchPageNumbers = () => {
    const totalPages = this.totalPages;
    const currentPage = this.state.currentPage;
    const pageNeighbours = this.pageNeighbours;

    const totalNumbers = this.pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      let pages = [];

      const leftBound = currentPage - pageNeighbours;
      const rightBound = currentPage + pageNeighbours;
      const beforeLastPage = totalPages - 1;

      const startPage = leftBound > 2 ? leftBound : 2;
      const endPage = rightBound < beforeLastPage ? rightBound : beforeLastPage;

      pages = range(startPage, endPage);

      const pagesCount = pages.length;
      const singleSpillOffset = totalNumbers - pagesCount - 1;

      const leftSpill = startPage > 2;
      const rightSpill = endPage < beforeLastPage;

      const leftSpillPage = LEFT_PAGE;
      const rightSpillPage = RIGHT_PAGE;

      if (leftSpill && !rightSpill) {
        const extraPages = range(startPage - singleSpillOffset, startPage - 1);
        pages = [leftSpillPage, ...extraPages, ...pages];
      } else if (!leftSpill && rightSpill) {
        const extraPages = range(endPage + 1, endPage + singleSpillOffset);
        pages = [...pages, ...extraPages, rightSpillPage];
      } else if (leftSpill && rightSpill) {
        pages = [leftSpillPage, ...pages, rightSpillPage];
      }

      return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
  };

  render() {
    if (!this.totalRecords) return null;

    if (this.totalPages === 1) return null;

    const { currentPage } = this.state;
    const pages = this.fetchPageNumbers();

    return (
      <Fragment>
        <Pagination aria-label='List Pagination'>
          {pages.map((page, index) => {
            if (page === LEFT_PAGE)
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    previous
                    href='#'
                    aria-label='Previous'
                    onClick={this.handleMoveLeft}
                  >
                    <span aria-hidden='true'>&laquo;</span>
                    <span className='sr-only'>Previous</span>
                  </PaginationLink>
                </PaginationItem>
              );

            if (page === RIGHT_PAGE)
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    next
                    href='#'
                    aria-label='Next'
                    onClick={this.handleMoveRight}
                  >
                    <span aria-hidden='true'>&raquo;</span>
                    <span className='sr-only'>Next</span>
                  </PaginationLink>
                </PaginationItem>
              );

            return (
              <PaginationItem key={index} active={currentPage === page}>
                <PaginationLink
                  href='#'
                  onClick={e => this.handleClick(page, e)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </Pagination>
      </Fragment>
    );
  }
}
