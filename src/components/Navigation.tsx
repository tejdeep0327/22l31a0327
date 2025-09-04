import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0 }}>
          <LinkIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            URL Shortener
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={location.pathname === '/' ? 'contained' : 'text'}
              startIcon={<LinkIcon />}
              onClick={() => navigate('/')}
              size="small"
            >
              Shorten
            </Button>
            <Button
              variant={location.pathname === '/stats' ? 'contained' : 'text'}
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/stats')}
              size="small"
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;