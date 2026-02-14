import { useSelector } from "react-redux";
import { Box, Tooltip } from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";

import NoData from "../../components/common/NoData";
import sortIcon from "../../assets/images/sort_icon.svg";
import sortIconAsc from "../../assets/images/sort_icon_asc.svg";
import sortIconDesc from "../../assets/images/sort_icon_desc.svg";

const renderNoData = () => (
  <NoData
    sx={{
      alignItems: "center",
      display: "flex",
      height: "100%",
      margin: 0,
    }}
  />
);

function Table({
  columns,
  rows,

  showPagination = true,
  pagingOptions = [5, 10, 25, 50, 100],
  paginationModel = {
    page: 1,
    pageSize: 10,
  },
  setPaginationModel,
  rowHeight = 50,
  totalRecords,
  isRowSelectable = false,
  // filterIcon,
  // sortIcon,
  gridRef,
  ...rest
}) {
  const { loading } = useSelector((state) => state.config);
  const customSortableColumns = columns.map(column => ({ ...column, sortable: column.sortable ?? false }));

  return (
    <Box sx={{ borderRadius: 2, mt: 3 }} ref={gridRef}>
      <DataGrid
        autoHeight
        columns={customSortableColumns}
        rows={rows}
        loading={loading}
        // disableColumnSorting
        disableColumnMenu
        hideFooterPagination={!showPagination}
        slotProps={{
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
        }}
        slots={{
          columnHeaderSortIcon: ({ direction }) => {
            return (
              <Tooltip placement='top-end' title={direction === "asc" ? "Ascending" : direction === "desc" ? "Descending" : ""}>
                <img
                  src={
                    direction === "asc" ?
                      sortIconAsc : direction === "desc" ?
                        sortIconDesc : sortIcon
                  }
                  alt="sort"
                />
              </Tooltip>
            );
          },
          noResultsOverlay: renderNoData,
          noRowsOverlay: renderNoData,
        }}
        disableColumnSelector
        pageSizeOptions={pagingOptions}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        rowCount={totalRecords}
        scrollbarSize={2}
        rowHeight={rowHeight}
        rowSelection={isRowSelectable}
        sx={{
          [`&.${gridClasses.root}`]: {
            border: "none",
            [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
              outline: "none"
            },
            [`& .${gridClasses.row}`]: {
              cursor: "pointer",
              "&:nth-of-type(odd)": {
                bgcolor: "subItemBg",
              },
              "&:hover": {
                bgcolor: "paginationBg",
              },
              [`& .${gridClasses.cell}`]: {
                border: "none",
                "&:focus, &:focus-within": { outline: "none" },
              },
            },
            [`& .${gridClasses.iconButtonContainer}`]: {
              visibility: "visible",
            },
            [`& .${gridClasses.footerContainer}`]: {
              minHeight: 15,
            },
            [`& .${gridClasses.sortIcon}`]: {
              opacity: "0.5 !important",
            },
            [`& .${gridClasses["columnHeader--sorted"]} .${gridClasses.sortIcon}`]:
            {
              opacity: "inherit !important",
            },
          },
        }}
        {...rest}
      />
    </Box>
  );
}

export default Table;
