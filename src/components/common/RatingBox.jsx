import { Box, Rating, Stack, styled } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "./MuiTypography";
import { useEffect, useState } from "react";
import InputBox from "./InputBox";
import { deepClone } from "@mui/x-data-grid/internals";
import { colors } from "../../styles/theme";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";

const StyledRating = styled(Rating)({
  "& .MuiRating-iconFilled": {
    color: colors.primary,
  },
  "& .MuiRating-iconHover": {
    color: colors.primary,
  },
});

function RatingStars({ rating, onChangeRating, onReasonChange }) {
  const { t } = useTranslation();

  const { loading } = useSelector((state) => state.config);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "start", sm: "center" }}
      justifyContent={"space-between"}
      my={2}
    >
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <StyledRating
          name={rating.id}
          value={Number(rating.value)}
          onChange={onChangeRating}
          size="large"
          disabled={loading}
        />
        <Box
          sx={{
            width: "25px",
            height: "25px",
            backgroundColor: "primary.main",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MuiTypography
            variant={"subtitle2"}
            sx={{
              color: colors.white,
            }}
          >
            {rating.value || 0}
          </MuiTypography>
        </Box>
      </Stack>
      <Box
        sx={{
          width: { xs: "100%", sm: "60%" },
        }}
      >
        <InputBox
          id={rating.reasonId}
          placeholder={t("review.rating_placeholder")}
          value={rating.reason}
          onInputChange={onReasonChange}
        />
      </Box>
    </Stack>
  );
}

function RatingBox({
  id: ratingId,
  onSelectChange,
  value: ratingArray,
  validation = {},
  initLoad,
}) {
  const { t } = useTranslation();

  const [error, setError] = useState("");

  useEffect(() => {
    // if (!error) {
    setError(validation?.error);
    // }
  }, [validation?.error]);

  function handleChangeReason(id, value) {
    const newRatingArray = deepClone(ratingArray);
    const fieldIndex = newRatingArray.findIndex((el) => el.reasonId === id);
    newRatingArray[fieldIndex].reason = value;
    onSelectChange(ratingId, newRatingArray);
  }

  function handleChangeRating(e, newValue) {
    const newRatingArray = deepClone(ratingArray);
    const fieldIndex = newRatingArray.findIndex(
      (el) => el.id === e.target.name
    );

    newRatingArray[fieldIndex].value = newValue;

    let validationError = "";
    if (!isEmpty(validation) && !initLoad) {
      if (validation.rules) {
        validationError = validation.rules(
          newRatingArray,
          "msg" in validation && validation.msg
        );
      }

      if (validationError === "" && validation.required) {
        validationError = newRatingArray ? "" : "invalid";
      }
    }

    onSelectChange(ratingId, newRatingArray, validationError);
  }

  return (
    <>
      <MuiTypography variant="h6">{t("review.rating1")}</MuiTypography>
      <RatingStars
        rating={ratingArray[0]}
        onChangeRating={handleChangeRating}
        onReasonChange={handleChangeReason}
      />
      <MuiTypography variant="h6">{t("review.rating2")}</MuiTypography>
      <RatingStars
        rating={ratingArray[1]}
        onChangeRating={handleChangeRating}
        onReasonChange={handleChangeReason}
      />
      <MuiTypography variant="h6">{t("review.rating3")}</MuiTypography>
      <RatingStars
        rating={ratingArray[2]}
        onChangeRating={handleChangeRating}
        onReasonChange={handleChangeReason}
      />
      <MuiTypography variant="h6">{t("review.rating4")}</MuiTypography>
      <RatingStars
        rating={ratingArray[3]}
        onChangeRating={handleChangeRating}
        onReasonChange={handleChangeReason}
      />

      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default RatingBox;
