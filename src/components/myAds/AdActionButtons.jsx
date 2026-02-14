import { useTranslation } from "react-i18next";
import { Edit2, Trash } from "iconsax-react";

import ActionButton from "../common/ActionButton";
import SquareIconBtn from "../common/SquareIconBtn";

function AdActionButtons({
  onEditAd,
  onReactiveAd,
  onDeleteAd,
  disabledReactiveAd,
}) {
  const { t } = useTranslation();

  return (
    <>
      <ActionButton
        variant="contained"
        onClick={onEditAd}
        startIcon={<Edit2 size={16} />}
        sx={{
          flex: 1,
        }}
      >
        {t("edit")}
      </ActionButton>
      <ActionButton
        variant="outlined"
        onClick={onReactiveAd}
        disabled={disabledReactiveAd}
        sx={{
          flex: 1,
        }}
      >
        {t("reactivate")}
      </ActionButton>
      <SquareIconBtn
        icon={Trash}
        onClick={onDeleteAd}
        tooltip={t("delete")}
        sx={{
          color: "error.main",
          ml: 0,
        }}
      />
    </>
  );
}

export default AdActionButtons;
