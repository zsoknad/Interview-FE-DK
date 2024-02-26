import '../App.css';

import { Outlet, Link } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';

const navItems = [
        { name: 'Home', url: '/' }
    ];

function Layout() {
  return (
    <>
        <Box sx={{ flexGrow: 1 }}>
            <AppBar 
                component="nav"
                position="static"
            >
                <Toolbar>
                    <SvgIcon                         
                        sx={{
                            width:"100px",
                            height:"34px",
                            mr: "10px"
                          }}>
                    {/* credit: plus icon from https://heroicons.com/ */}
                        <svg 
                        viewBox="0 0 100 34"
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg">
                            <path 
                            d="M18.5488 6.15808L12.3224 18.2228H2.52525V6.15808H0V33.5032H2.52525V20.5203H12.3234L18.8939 33.5032H21.647L14.6142 19.4471L21.3019 6.15808H18.5488Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M38.8067 5.65869C43.0145 5.65869 46.3009 6.99942 48.6658 9.68089C51.0806 12.4969 52.348 16.1201 52.2159 19.8293C52.3495 23.5388 51.0834 27.1625 48.6695 29.9797C46.3059 32.6605 43.0183 34.0009 38.8067 34.0009C34.5695 34.0009 31.2757 32.6605 28.9251 29.9797C26.5233 27.1568 25.2654 23.5352 25.3994 19.8293C25.2655 16.1238 26.5235 12.5025 28.9251 9.67995C31.2775 6.99974 34.5714 5.65932 38.8067 5.65869ZM32.7219 29.9412C34.5136 31.1568 36.6436 31.7734 38.8067 31.7025C40.9733 31.7754 43.1072 31.1587 44.9018 29.9412C46.4808 28.86 47.7127 27.3435 48.4482 25.5754C49.1763 23.7488 49.5385 21.7968 49.5144 19.8303C49.5385 17.8641 49.1762 15.9124 48.4482 14.0862C47.7129 12.3177 46.481 10.8008 44.9018 9.71939C43.1073 8.50154 40.9734 7.88456 38.8067 7.95709C36.6435 7.8865 34.5135 8.5034 32.7219 9.71939C31.1434 10.8011 29.9116 12.3175 29.1755 14.0852C28.4475 15.9115 28.0853 17.8632 28.1093 19.8293C28.0852 21.7958 28.4474 23.7479 29.1755 25.5744C29.9117 27.3421 31.1434 28.8594 32.7219 29.9412Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M60.1962 6.15723H57.6719V33.5033H60.1962V6.15723Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M81.101 6.15723L90.8935 33.5024H88.1742L85.0751 24.6562H71.3658L68.2666 33.5024H65.6279L75.3801 6.15817L81.101 6.15723ZM76.9114 8.83776L72.1684 22.3578H84.2761L79.5332 8.83776H76.9114Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M94.5637 0H94.1652V4.62782H94.5637V0Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M94.5636 6.65857H94.165V11.2864H94.5636V6.65857Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M93.3495 5.44269H88.7285V5.84121H93.3495V5.44269Z" 
                            fill="white"
                            >
                            </path>
                            <path 
                            d="M99.9999 5.44385H95.3789V5.84237H99.9999V5.44385Z" 
                            fill="white"
                            >
                            </path>
                        </svg>
                    </SvgIcon>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { sm: 'block' } }}
                    >
                        Interview Task
                    </Typography>
                    <Box sx={{ display: { sm: 'block' } }}>
                        {navItems.map((item) => (
                            <Button key={item.name} component={Link} to={item.url} sx={{ color: '#fff' }}>
                                {item.name}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
        <Outlet />
    </>
  );
};

export default Layout;