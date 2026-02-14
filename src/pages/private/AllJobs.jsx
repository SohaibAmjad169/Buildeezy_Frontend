import { useState } from "react";
import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import JobCardList from "../../components/allJobs/JobCardList";
import MuiTypography from "../../components/common/MuiTypography";
import SearchBox from "../../components/appBar/SearchBox";

function AllJobs() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [initLoad, setInitLoad] = useState(true);

  function onSearch(value) {
    setInitLoad(false);
    setSearch(value);
  }

  return (
    <Box sx={{ height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            mb: { xs: 2, sm: 0 },
          }}
        >
          <MuiTypography variant="h2">{t("job.all_jobs_title")}</MuiTypography>
        </Box>

        <SearchBox query={search} handleInputChange={onSearch}
          placeholder={t("job.all_jobs_title")}
        />
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      <JobCardList query={search} initLoad={initLoad} />
    </Box>
  );
}

export default AllJobs;
