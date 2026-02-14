import { Bank } from "iconsax-react";
import { USER_TYPES } from "../utils/constants/login";

function usePointsCards(userType) {
  const COMMON_ACCOUNTS_CARDS = [ 
    // {
    //   id: 1,
    //   isDisabled: false,
    //   mediaIcon: <Briefcase size={20} variant="Outline" />,
    //   title: "Points",
    //   navigateTo: "/points",
    // },
    {
      id: 1,
      isDisabled: false,
      mediaIcon: <Bank size={20} variant="Outline" />,
      title: "Connect Bank Account",
      navigateTo: "",
    },
  ];

  const mapCards = {
    [USER_TYPES.client]: COMMON_ACCOUNTS_CARDS,
    [USER_TYPES.contractor]: COMMON_ACCOUNTS_CARDS,
    [USER_TYPES.specialist]: COMMON_ACCOUNTS_CARDS,
    [USER_TYPES.vendor]: COMMON_ACCOUNTS_CARDS,
  };
  return [mapCards[userType]];
}

export default usePointsCards;
