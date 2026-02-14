import { alpha, Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';

import MuiTypography from "../common/MuiTypography";
import icon from "../../assets/images/lets_start_icon.png";
import bg from "../../assets/images/lets_start_stripes.svg";

export default function LetsStart({ sx }) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<Box sx={{ mt: 'auto' }}>
			<Box
				sx={{
					transition: 'opacity 0.25s ease-in-out',
					m: theme => theme.spacing(8, 3, 3),
					p: theme => theme.spacing(8, 3, 3),
					bgcolor: "primary.main",
					color: "common.white",
					position: "relative",
					textAlign: "center",
					borderRadius: 5,
					minWidth: 180,
					...sx,
				}}
			>
				<Box
					component="img"
					src={bg}
					alt="BG Stripe"
					sx={{
						position: "absolute",
						objectFit: "cover",
						height: "100%",
						width: "100%",
						zIndex: 0,
						left: 0,
						top: 0,
					}}
				/>
				<Box
					component="img"
					src={icon}
					alt="Icon"
					sx={{
						pointerEvents: 'none',
						position: "absolute",
						objectFit: "cover",
						height: 150,
						width: 150,
						left: 20,
						top: -68,
					}}
				/>
				<MuiTypography
					variant={"h3"}
					sx={{ color: "common.white", mb: 0.75}}
				>
					{t("lets_start.title")}
				</MuiTypography>
				<Box sx={{
					color: theme => alpha(theme.palette.common.white, 0.5),
					fontSize: "0.76rem",
					lineHeight: 1.4,
					fontWeight: 400,
					// color: mode === "dark" ? colors.white : "#12121299",
					whiteSpace: "normal",
					display:"block",
					mb: 1,
				}}>
					{t("lets_start.description")}
				</Box>
				<Button
					variant="primary"
					sx={{
						bgcolor: "white10",
						fontSize: "0.8rem",
						borderRadius: 10,
						width: "100%",
						py: 0.8,
					}}
					onClick={() => navigate("/post-an-ad")}
				>
					{t("lets_start.action")}
				</Button>
			</Box>
		</Box>
	)
}
