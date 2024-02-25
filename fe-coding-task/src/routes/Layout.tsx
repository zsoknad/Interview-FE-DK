import '../App.css';

import { Outlet, Link } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

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
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { sm: 'block' } }}
                    >
                        DK for KOIASOFT
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