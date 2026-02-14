import { useTranslation } from "react-i18next";
import { Edit2, Trash } from "iconsax-react";
import PropTypes from "prop-types";

import ActionButton from "../common/ActionButton";
import SquareIconBtn from "../common/SquareIconBtn";

function PortfolioActionButtons({ onEdit, onDelete, onStatusChange, status }) {
  const { t } = useTranslation();

  const isPublished = status === "published";

  return (
    <>
      <ActionButton
        variant="contained"
        onClick={onEdit}
        startIcon={Edit2}
        sx={{
          flex: 1,
        }}
      >
        {t("edit")}
      </ActionButton>
      <ActionButton
        variant="outlined"
        onClick={onStatusChange}
        sx={{
          flex: 1,
        }}
      >
        {isPublished ? t("save_as_draft") : t("common.publish")}
      </ActionButton>
      <SquareIconBtn
        icon={Trash}
        onClick={onDelete}
        tooltip={t("delete")}
        sx={{
          color: "error.main",
          ml: 0,
        }}
      />
    </>
  );
}

PortfolioActionButtons.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  status: PropTypes.oneOf(["draft", "published"]).isRequired,
};

export default PortfolioActionButtons;
