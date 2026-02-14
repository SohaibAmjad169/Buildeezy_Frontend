import { Box, Card, Pagination, PaginationItem } from "@mui/material";
import MuiTypography from "./MuiTypography";


function PaginationCard({ count, page, onPageChange, title, subtitle, subtitleHtml }) {
  return (
    <Card
      sx={{
        borderRadius: "20px",
        width: { xs: "100%", lg: "70%" },
        boxShadow: "none",
        borderStyle: "dashed",
        borderWidth: "2px",
        borderColor: "borderColor100",
        backgroundColor: "paginationBg",
      }}
    >
      <MuiTypography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </MuiTypography>
      {subtitleHtml ? (
        <MuiTypography variant="subtitle1" sx={{ mb: 2 }} component="div">
          <span dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
        </MuiTypography>
      ) : (
        <MuiTypography variant="subtitle1" sx={{ mb: 2 }}>
          {subtitle}
        </MuiTypography>
      )}

      <Box sx={{ mt: 3, ml: 0.5 }}>
        <Pagination
          count={count}
          page={page}
          onChange={onPageChange}
          size="small"
          renderItem={(item) => {
            return (
              <PaginationItem
                {...item}
                page={
                  <Box
                    sx={{
                      backgroundColor: "primary.main",
                      borderRadius: 3,
                      height: "3px",
                      width: "3px",
                    }}
                  />
                }
              />
            );
          }}
          sx={{
            "& .MuiButtonBase-root": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              lineHeight: 1,
              minWidth: "22px",
              height: "22px",
            },
          }}
        />
      </Box>
    </Card>
  );
}

export default PaginationCard;
