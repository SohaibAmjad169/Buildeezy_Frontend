import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Rating,
  Paper,
  Divider,
  Container,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { getSingleCatalogue } from "../../../apis/apiEndPoints";
import { useEffect } from "react";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { setAlert } from "../../../redux/configSlice";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { useParams } from "react-router-dom";
import CatalogueTabsAndSearch from "../../../components/catalogue/CatalogueTabsAndSearch";

const productImages = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
];

const SingleCatalogue = () => {
  const { id } = useParams();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selected, setSelected] = useState("DreamRest 1");
  const [loading, setLoading] = useState(false);
  const [catalogueDetails, setCatalogueDetails] = useState({});
  const products = [
    { id: "DreamRest 1", price: catalogueDetails.price || 100 },
    { id: "DreamRest 2", price: catalogueDetails.promotionPrice || 100 },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + productImages.length) % productImages.length
    );
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    async function singleCatalogueList() {
      try {
        setLoading(true);
        const response = await getSingleCatalogue(id);
        setCatalogueDetails(response?.data?.catalogue);
        setLoading(false);
      } catch (error) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error?.message,
          })
        );
        setLoading(false);
      }
    }
    singleCatalogueList();
  }, []);

  if (loading) {
    return <AdListSkeleton />;
  }

  return (
    <Box>
      <CatalogueTabsAndSearch
        catalogueDetails={catalogueDetails}
        page={`/sigle-catalogue`}
      />
      <Box maxWidth="xl" sx={{ py: { xs: 0, md: 4 } }}>
        {/* Mobile Layout */}
        {isMobile && (
          <Box>
            {/* Mobile Image Section */}
            <Box sx={{ position: "relative", mb: 3 }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/3",
                  borderRadius: 4,
                  overflow: "hidden",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <img
                  src={
                    productImages[currentImageIndex] ||
                    "/placeholder.svg?height=400&width=600"
                  }
                  alt="Product preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Left Button */}
                <IconButton
                  sx={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px", // Rounded square
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    width: 54,
                    height: 54,
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                    zIndex: 2,
                  }}
                  onClick={prevImage}
                >
                  <ChevronLeftIcon fontSize="medium" />
                </IconButton>

                {/* Right Button */}
                <IconButton
                  sx={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px", // Rounded square
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    width: 54,
                    height: 54,
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                    zIndex: 2,
                  }}
                  onClick={nextImage}
                >
                  <ChevronRightIcon fontSize="medium" />
                </IconButton>
              </Box>
            </Box>

            {/* Mobile Product Info */}
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "18px", md: "20px" },
                    fontWeight: 600,
                  }}
                >
                  {catalogueDetails?.title}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label="Bedroom"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      color: "#6941C6",
                      borderColor: "#E9D7FE",
                      fontSize: "12px",
                      background: "#F9F5FF",
                    }}
                  />
                  <Chip
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box
                          component="span"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#3538CD",
                            display: "inline-block",
                          }}
                        />
                        New
                      </Box>
                    }
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      color: "#3538CD",
                      borderColor: "#C7D7FE",
                      fontSize: "12px",
                      background: "#EEF4FF",
                    }}
                  />
                </Box>
              </Box>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "13px", lineHeight: "23px", fontWeight: 400 }}
              >
                {catalogueDetails?.description}
              </Typography>

              <Box
                sx={{
                  display: {
                    xs: "flex",
                  },
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: { xs: 1, sm: 0 },
                }}
              >
                {/* Type */}
                <Box>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Type
                  </Typography>
                  <Typography
                    sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}
                  >
                    {catalogueDetails?.typeName}
                  </Typography>
                </Box>

                {/* Category */}
                <Box>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Category
                  </Typography>
                  <Typography
                    sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}
                  >
                    {catalogueDetails?.categoryName}
                  </Typography>
                </Box>

                {/* Lana Steiner */}
                <Box>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Lana Steiner
                  </Typography>
                  <Typography
                    sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}
                  >
                    Contractor
                  </Typography>
                </Box>

                {/* Rating */}
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Rating
                      value={catalogueDetails?.totalRatings}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                      {catalogueDetails?.totalRatings}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}
                  >
                    202 reviews
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mt: 1.5 }} />

              <Box display="flex" gap={2} flexWrap="wrap">
                {products.map((product) => {
                  const isSelected = selected === product.id;

                  return (
                    <Paper
                      key={product.id}
                      onClick={() => setSelected(product.id)}
                      elevation={0}
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: `1px solid ${isSelected ? "#59862E" : "#565656"
                          }`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        lineHeight={1.4}
                        sx={{
                          fontSize: "12px",
                          fontWeight: 400,
                        }}
                      >
                        {product.id}
                      </Typography>
                      <Typography
                        sx={{
                          color: isSelected ? "#59862E" : "#646464",
                          fontSize: "12px",
                          fontWeight: isSelected ? 650 : 400,
                        }}
                      >
                        US${""} {product.price}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </Stack>
          </Box>
        )}

        {/* Desktop & Laptop Layout */}
        {!isMobile && (
          <Grid container spacing={3}>
            {/* Left Column - Images */}
            <Grid item xs={12} lg={6}>
              <Stack spacing={2}>
                {/* Main Image */}
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "4/3",
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <img
                    src={
                      productImages[currentImageIndex] ||
                      "/placeholder.svg?height=450&width=600"
                    }
                    alt="DreamRest bed"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>

                {/* Thumbnails with Swiper */}
                <Box sx={{ width: "100%" }}>
                  <Swiper
                    modules={[Mousewheel, FreeMode]}
                    spaceBetween={25}
                    slidesPerView="auto"
                    freeMode={true}
                    mousewheel={{
                      forceToAxis: true,
                      sensitivity: 1,
                      releaseOnEdges: true,
                    }}
                    style={{
                      paddingBottom: "8px",
                    }}
                  >
                    {productImages.map((image, index) => (
                      <SwiperSlide key={index} style={{ width: "auto" }}>
                        <Box
                          onClick={() => selectImage(index)}
                          sx={{
                            width: 65,
                            height: 65,
                            borderRadius: 1,
                            overflow: "hidden",
                            // border: 2,
                            // borderColor: index === currentImageIndex ? "#1976d2" : "#e0e0e0",
                            cursor: "pointer",
                            transition: "border-color 0.2s",
                            // "&:hover": {
                            //   borderColor: "#1976d2",
                            // },
                          }}
                        >
                          <img
                            src={image || "/placeholder.svg?height=64&width=64"}
                            alt={`Thumbnail ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </Box>
              </Stack>
            </Grid>

            {/* Right Column - Product Info */}
            <Grid item xs={12} lg={6}>
              <Stack spacing={3}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center" // vertically center items
                  flexWrap="wrap"
                  gap={2}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: "16px", sm: "20px" },
                      fontWeight: 600,
                    }}
                  >
                    {catalogueDetails?.title}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label="Bedroom"
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        color: "#6941C6",
                        borderColor: "#E9D7FE",
                        fontSize: "14px",
                        background: "#F9F5FF",
                      }}
                    />
                    <Chip
                      label={
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Box
                            component="span"
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "#3538CD",
                              display: "inline-block",
                            }}
                          />
                          New
                        </Box>
                      }
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        color: "#3538CD",
                        borderColor: "#C7D7FE",
                        fontSize: "14px",
                        background: "#EEF4FF",
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: "14px", lineHeight: "23px", fontWeight: 400 }}
                >
                  {catalogueDetails?.description}
                </Typography>

                {/* Desktop Specifications - 1x4 Grid */}
                <Box
                  sx={{
                    py: {
                      xs: 0,
                      lg: 3,
                    },
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={3}>
                      <Typography
                        sx={{ fontSize: "14px", fontWeight: 600 }}
                        color="text.primary"
                      >
                        Type
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#475467",
                          py: "5px",
                        }}
                        color="text.primary"
                      >
                        {catalogueDetails?.typeName}
                      </Typography>
                    </Grid>

                    <Grid item xs={3}>
                      <Typography
                        sx={{ fontSize: "14px", fontWeight: 600 }}
                        color="text.primary"
                      >
                        Category
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#475467",
                          py: "5px",
                        }}
                        color="text.primary"
                      >
                        {catalogueDetails?.categoryName}
                      </Typography>
                    </Grid>

                    <Grid item xs={3}>
                      <Typography
                        sx={{ fontSize: "14px", fontWeight: 600 }}
                        color="text.primary"
                      >
                        Lana Steiner
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#475467",
                          py: "5px",
                        }}
                        color="text.primary"
                      >
                        Contractor
                      </Typography>
                    </Grid>

                    <Grid item xs={3}>
                      <Box
                        display="flex"
                        alignItems="center"
                        mb={0.5}
                        gap={0.5}
                      >
                        <Rating
                          value={catalogueDetails?.totalRatings}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography
                          sx={{ fontSize: "14px", fontWeight: 600 }}
                          color="text.primary"
                        >
                          {catalogueDetails?.totalRatings}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#475467",
                          py: "5px",
                        }}
                        color="text.primary"
                      >
                        202 reviews
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ mt: 1.5 }} />

                <Box display="flex" gap={2} flexWrap="wrap">
                  {products.map((product) => {
                    const isSelected = selected === product.id;

                    return (
                      <Paper
                        key={product.id}
                        onClick={() => setSelected(product.id)}
                        elevation={0}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: "8px",
                          cursor: "pointer",
                          border: `1px solid ${isSelected ? "#59862E" : "#565656"
                            }`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          lineHeight={1.4}
                          sx={{
                            fontSize: "12px",
                            fontWeight: 400,
                          }}
                        >
                          {product.id}
                        </Typography>
                        <Typography
                          sx={{
                            color: isSelected ? "#59862E" : "#646464",
                            fontSize: "12px",
                            fontWeight: isSelected ? 650 : 400,
                          }}
                        >
                          US${""} {product.price}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SingleCatalogue;
