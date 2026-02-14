import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Button,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Rating,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { setAlert } from "../../../redux/configSlice";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { 
  getCatalogueCategory, 
  getCatalogueType, 
  getCatalogue,
  getSingleCatalogue 
} from "../../../apis/apiEndPoints";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import Defultimage from "../../../assets/images/Defultimage.jpg";

// Fallback images if no product images are available
const fallbackImages = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
];

export default function Catalogue() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // If viewing single item

  // View states
  const [currentView, setCurrentView] = useState(id ? 'single' : 'list'); // 'list' or 'single'
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);

  // Data states
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // Single item states
  const [catalogueDetails, setCatalogueDetails] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("DreamRest 1");

  // Load initial data
  useEffect(() => {
    if (currentView === 'single' && id) {
      loadSingleItem();
    } else {
      loadAllData();
    }
  }, [currentView, id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await getCatalogueCategory();
      const categoriesData = categoriesResponse?.data?.data || [];
      setCategories(categoriesData);
      
      // Load all types and items efficiently
      const allTypes = [];
      const allItems = [];
      
      for (const category of categoriesData) {
        try {
          // Load types for this category
          const typesResponse = await getCatalogueType(category.id);
          const typesData = typesResponse?.data?.data || [];
          
          for (const type of typesData) {
            allTypes.push({
              ...type,
              categoryId: category.id,
              categoryName: category.title
            });
            
            // Load items for this type
            try {
              const itemsResponse = await getCatalogue(type.id);
              const itemsData = itemsResponse?.data?.data || [];
              
              allItems.push(...itemsData.map(item => ({
                ...item,
                typeId: type.id,
                typeName: type.title,
                categoryId: category.id,
                categoryName: category.title,
                // Use the actual price from API
                price: parseFloat(item.price) || 0,
                promotionPrice: parseFloat(item.promotionPrice) || 0,
                // Use the actual ratings from API
                totalRatings: parseFloat(item.averageRatings) || 0,
                reviewCount: item.totalRatings || 0,
                // Process images
                image: item.productInformationFile,
                images: item.catalogueImages || []
              })));
            } catch (error) {
              console.warn(`Failed to load items for type ${type.id}`);
            }
          }
        } catch (error) {
          console.warn(`Failed to load types for category ${category.id}`);
        }
      }
      
      setTypes(allTypes);
      setItems(allItems);
      setFilteredItems(allItems);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error?.message,
        })
      );
    }
  };

  const loadSingleItem = async () => {
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
  };

  // Filter and search logic
  useEffect(() => {
    if (currentView === 'single') return;

    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item =>
        selectedCategories.includes(item.categoryId)
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item =>
        selectedTypes.includes(item.typeId)
      );
    }

    // Price filter
    filtered = filtered.filter(item =>
      (item.price || 0) >= priceRange[0] && (item.price || 0) <= priceRange[1]
    );

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(item =>
        (item.totalRatings || 0) >= selectedRating
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategories, selectedTypes, priceRange, selectedRating, sortBy, currentView]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTypeChange = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedSubCategories([]);
    setPriceRange([0, 1000]);
    setSelectedRating(0);
    setSearchQuery('');
  };

  const handleItemClick = (itemId) => {
    setCurrentView('single');
    navigate(`/catalogue/item/${itemId}`);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    navigate('/catalogue');
  };

  // Single item navigation functions
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

  const FilterContent = () => (
    <Box sx={{ p: 2, minWidth: isMobile ? 'auto' : 280 }}>
      {/* Clear Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        <Button size="small" onClick={clearAllFilters}>
          Clear All
        </Button>
      </Box>

      {/* Categories Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {categories.map((category) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    size="small"
                  />
                }
                label={category.title}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Types Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Types</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {types
              .filter(type => selectedCategories.length === 0 || selectedCategories.includes(type.categoryId))
              .map((type) => (
              <FormControlLabel
                key={type.id}
                control={
                  <Checkbox
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => handleTypeChange(type.id)}
                    size="small"
                  />
                }
                label={`${type.title} (${type.categoryName})`}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Price Range Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={10}
          />
          <Typography variant="body2" color="text.secondary" mt={1}>
            ${priceRange[0]} - ${priceRange[1]}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Rating Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Minimum Rating</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Rating
            value={selectedRating}
            onChange={(e, newValue) => setSelectedRating(newValue || 0)}
            precision={0.5}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const ItemCard = ({ item }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
      onClick={() => handleItemClick(item.id)}
    >
      <CardMedia
        component="img"
        height="200"
        image={item.image || Defultimage}
        alt={item.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {item.description}
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <Chip
            label={item.categoryName}
            size="small"
            variant="outlined"
            sx={{ fontSize: '10px' }}
          />
          <Chip
            label={item.typeName}
            size="small"
            variant="outlined"
            sx={{ fontSize: '10px' }}
          />
        </Box>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Rating value={item.totalRatings || 0} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            ({item.reviewCount || 0} reviews)
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            ${item.price || 0}
          </Typography>
          {item.promotionPrice && item.promotionPrice !== item.price && (
            <Typography 
              variant="body2" 
              sx={{ 
                textDecoration: 'line-through', 
                color: 'text.secondary' 
              }}
            >
              ${item.promotionPrice}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <AdListSkeleton />;
  }

  // Single Item View
  if (currentView === 'single') {
    // Get actual product images from catalogue details
    const productImages = catalogueDetails.catalogueImages?.map(img => img.imageUrl) || 
                         (catalogueDetails.productInformationFile ? [catalogueDetails.productInformationFile] : fallbackImages);
    
    const products = [
      { id: "Standard", price: catalogueDetails.price || 0 },
      { id: "Promotion", price: catalogueDetails.promotionPrice || 0 },
    ];

    return (
      <Box p={0}>
        {/* Header with Back Button */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton onClick={handleBackToList}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={600}>
              {catalogueDetails?.title}
            </Typography>
          </Box>
        </Box>

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

                  {/* Navigation Buttons */}
                  <IconButton
                    sx={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      width: 54,
                      height: 54,
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      zIndex: 2,
                    }}
                    onClick={prevImage}
                  >
                    <ChevronLeftIcon fontSize="medium" />
                  </IconButton>

                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      width: 54,
                      height: 54,
                      "&:hover": { backgroundColor: "#f0f0f0" },
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h3" sx={{ fontSize: { xs: "18px", md: "20px" }, fontWeight: 600 }}>
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

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: { xs: 1, sm: 0 } }}>
                  <Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>Type</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}>
                      {catalogueDetails?.typeName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>Category</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}>
                      {catalogueDetails?.categoryName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>Lana Steiner</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}>
                      Contractor
                    </Typography>
                  </Box>
                  <Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Rating value={catalogueDetails?.totalRatings} precision={0.5} readOnly size="small" />
                      <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                        {catalogueDetails?.totalRatings}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467" }}>
                      202 reviews
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mt: 1.5 }} />

                <Box display="flex" gap={2} flexWrap="wrap">
                  {products.map((product) => {
                    const isSelected = selectedProduct === product.id;
                    return (
                      <Paper
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        elevation={0}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: "8px",
                          cursor: "pointer",
                          border: `1px solid ${isSelected ? "#59862E" : "#565656"}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="subtitle1" lineHeight={1.4} sx={{ fontSize: "12px", fontWeight: 400 }}>
                          {product.id}
                        </Typography>
                        <Typography
                          sx={{
                            color: isSelected ? "#59862E" : "#646464",
                            fontSize: "12px",
                            fontWeight: isSelected ? 650 : 400,
                          }}
                        >
                          US$ {product.price}
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
                      style={{ paddingBottom: "8px" }}
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
                              cursor: "pointer",
                              transition: "border-color 0.2s",
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
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Typography variant="h3" sx={{ fontSize: { xs: "16px", sm: "20px" }, fontWeight: 600 }}>
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

                  {/* Desktop Specifications */}
                  <Box sx={{ py: { xs: 0, lg: 3 } }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600 }} color="text.primary">
                          Type
                        </Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467", py: "5px" }}>
                          {catalogueDetails?.typeName}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600 }} color="text.primary">
                          Category
                        </Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467", py: "5px" }}>
                          {catalogueDetails?.categoryName}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600 }} color="text.primary">
                          Lana Steiner
                        </Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467", py: "5px" }}>
                          Contractor
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Box display="flex" alignItems="center" mb={0.5} gap={0.5}>
                          <Rating value={catalogueDetails?.totalRatings} precision={0.5} readOnly size="small" />
                          <Typography sx={{ fontSize: "14px", fontWeight: 600 }} color="text.primary">
                            {catalogueDetails?.totalRatings}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: "#475467", py: "5px" }}>
                          202 reviews
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ mt: 1.5 }} />

                  <Box display="flex" gap={2} flexWrap="wrap">
                    {products.map((product) => {
                      const isSelected = selectedProduct === product.id;
                      return (
                        <Paper
                          key={product.id}
                          onClick={() => setSelectedProduct(product.id)}
                          elevation={0}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: `1px solid ${isSelected ? "#59862E" : "#565656"}`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="subtitle1" lineHeight={1.4} sx={{ fontSize: "12px", fontWeight: 400 }}>
                            {product.id}
                          </Typography>
                          <Typography
                            sx={{
                              color: isSelected ? "#59862E" : "#646464",
                              fontSize: "12px",
                              fontWeight: isSelected ? 650 : 400,
                            }}
                          >
                            US$ {product.price}
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
  }

  // List View
  return (
    <Box p={0}>
      {/* Header */}
      <Box mb={3}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography
              sx={{
                fontSize: { xs: "16px", sm: "18px", md: "20px", lg: "22px" },
                fontWeight: 550,
              }}
            >
              {t("catalogue.catalogue")} ({filteredItems.length} items)
            </Typography>
          </Grid>
          
          {/* Search bar */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                height: "40px",
                pl: 1.5,
                pr: 2,
                gap: 1,
              }}
            >
              <SearchIcon sx={{ color: "text.disabled", fontSize: "20px" }} />
              <input
                type="text"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  color: "inherit",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedTypes.length > 0 || selectedRating > 0) && (
        <Box mb={2}>
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {selectedCategories.map(categoryId => {
              const category = categories.find(c => c.id === categoryId);
              return (
                <Chip
                  key={categoryId}
                  label={category?.title}
                  size="small"
                  onDelete={() => handleCategoryChange(categoryId)}
                />
              );
            })}
            {selectedTypes.map(typeId => {
              const type = types.find(t => t.id === typeId);
              return (
                <Chip
                  key={typeId}
                  label={type?.title}
                  size="small"
                  onDelete={() => handleTypeChange(typeId)}
                />
              );
            })}
            {selectedRating > 0 && (
              <Chip
                label={`${selectedRating}+ stars`}
                size="small"
                onDelete={() => setSelectedRating(0)}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Controls Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2} alignItems="center">
          {isMobile && (
            <IconButton onClick={() => setMobileFiltersOpen(true)}>
              <FilterListIcon />
            </IconButton>
          )}
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <IconButton
            onClick={() => setViewMode('grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
          >
            <GridViewIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ViewListIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Desktop Filters Sidebar */}
        {!isMobile && (
          <Grid item md={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <FilterContent />
            </Box>
          </Grid>
        )}

        {/* Items Grid */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          {filteredItems.length > 0 ? (
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid 
                  item 
                  key={item.id} 
                  xs={viewMode === 'list' ? 12 : 12} 
                  sm={viewMode === 'list' ? 12 : 6} 
                  md={viewMode === 'list' ? 12 : 6} 
                  lg={viewMode === 'list' ? 12 : 4}
                >
                  <ItemCard item={item} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="400px"
              flexDirection="column"
              gap={2}
            >
              <Typography variant="h6" color="text.secondary">
                No items found
              </Typography>
              <Button variant="outlined" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: '100%', maxWidth: 400 } }}
      >
        <FilterContent />
      </Drawer>
    </Box>
  );
}