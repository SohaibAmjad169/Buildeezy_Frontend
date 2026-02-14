import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import buildeezyPlaceholder from "../../assets/images/buildeezy-placeholder.png";


const CommonCard = ({ title, image, onClick, description }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #ccc", // Added border with light gray color
        overflow: "hidden",
        width: "100%",
        maxWidth: 450,
        mx: "auto",
        p: 0, // Remove padding
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          image={buildeezyPlaceholder}
          alt={title}
          sx={{
            width: "100%",
            height: { xs: 150 },
            objectFit: "cover",
          }}
        />
        <CardContent
          sx={{
            height: "74px",
            display: "flex",
            flexDirection: "column", // stack items vertically
            justifyContent: "center", // vertically center the whole block
            px: 0,
            py: 0,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#171E4A",
              fontSize: "20px",
              textAlign: "left",
              pl: 2,
              m: 0,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 400,
              color: "#171E4A",
              fontSize: "15px",
              textAlign: "left",
              pl: 2,
              m: 0,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CommonCard;
