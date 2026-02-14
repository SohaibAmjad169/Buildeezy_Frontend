import { useTranslation } from "react-i18next";
import { Edit2, Trash } from "iconsax-react";

import ActionButton from "../common/ActionButton";
import SquareIconBtn from "../common/SquareIconBtn";

function WebinarActionButtons({
  onEditWebinar,
  onDeleteWebinar,
}) {
  const { t } = useTranslation();

  return (
    <>
      <ActionButton
        variant="contained"
        onClick={onEditWebinar}
        startIcon={Edit2}
        sx={{
          flex: 1,
        }}
      >
        {t("edit")}
      </ActionButton>
      <SquareIconBtn
        icon={Trash}
        onClick={onDeleteWebinar}
        tooltip={t("delete")}
        sx={{
          color: "error.main",
          ml: 0,
        }}
      />
    </>
  );
}

export default WebinarActionButtons;
