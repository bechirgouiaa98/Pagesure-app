import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Home = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const extractPageId = (url: string) => {
    const match = url.match(/facebook\.com\/(.+)/);
    if (!match) return null;
    let path = match[1].split('?')[0];
    // For profile.php?id=... URLs, use the id as the pageId
    if (path === 'profile.php') {
      const idMatch = url.match(/[?&]id=(\d+)/);
      if (idMatch) return `profile_${idMatch[1]}`;
      return 'profile.php'; // fallback
    }
    // For normal pages, use the path (e.g., page name)
    return path.replace(/\/$/, ''); // remove trailing slash
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!url) {
      setError('Veuillez entrer une URL');
      setLoading(false);
      return;
    }

    if (!url.includes('facebook.com/')) {
      setError('Veuillez entrer une URL Facebook valide');
      setLoading(false);
      return;
    }

    try {
      const pageId = extractPageId(url);
      if (!pageId) {
        setError('Impossible d\'extraire l\'identifiant de la page Facebook');
        setLoading(false);
        return;
      }
      const pageRef = doc(db, 'pages', pageId);
      const pageSnap = await getDoc(pageRef);

      let pageData;
      if (pageSnap.exists()) {
        pageData = pageSnap.data();
      } else {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error('Erreur lors de l\'analyse de la page');
        pageData = await response.json();

        await setDoc(pageRef, pageData);
      }

      navigate(`/page/${pageId}`, { state: { pageData } });
    } catch (error) {
      setError('Une erreur est survenue lors de l\'analyse de la page');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#F7F8FA',
        py: { xs: 4, md: 10 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: { xs: 1, md: 0 },
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', px: { xs: 0.5, md: 0 } }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            letterSpacing: 0.5,
            mb: 1.5,
            color: '#1F2937',
            lineHeight: 1.13,
            mt: 2,
          }}
        >
          Achetez en confiance
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ mb: 4, color: '#10B981', fontWeight: 500, fontSize: { xs: 16, md: 22 }, opacity: 0.95, lineHeight: 1.4 }}
        >
          Des avis réels
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', maxWidth: 500 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={!!error}
            helperText={error}
            placeholder="Rechercher une page Facebook…"
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
              fontSize: { xs: 20, md: 24 },
              fontWeight: 500,
              color: '#1F2937',
              height: { xs: 56, md: 68 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
                fontSize: { xs: 20, md: 24 },
                fontWeight: 500,
                color: '#1F2937',
                background: '#FFFFFF',
                boxShadow: 'none',
                height: { xs: 56, md: 68 },
              },
              '& .MuiInputBase-input': {
                py: { xs: 2, md: 2.5 },
                px: { xs: 2, md: 2.5 },
              },
              mr: { xs: 1, md: 2.5 },
            }}
            InputLabelProps={{ sx: { fontWeight: 600, color: '#10B981' } }}
            inputProps={{ style: { fontSize: 20, color: '#1F2937' } }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              minWidth: { xs: 52, md: 72 },
              minHeight: { xs: 52, md: 72 },
              width: { xs: 52, md: 72 },
              height: { xs: 52, md: 72 },
              borderRadius: '50%',
              background: '#10B981',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
              ml: { xs: 0.5, md: 1 },
              p: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: '#059669',
                boxShadow: '0 4px 16px rgba(16,185,129,0.18)',
              },
            }}
            disabled={loading}
          >
            <SearchIcon sx={{ fontSize: { xs: 32, md: 38 } }} />
          </Button>
        </form>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.07)' }}>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: 32, mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1F2937', mb: 0.5 }}>Avis vérifiés</Typography>
              <Typography sx={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Des avis authentiques pour chaque page.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.07)' }}>
              <GroupsIcon sx={{ color: '#2563EB', fontSize: 32, mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1F2937', mb: 0.5 }}>Communauté active</Typography>
              <Typography sx={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Partage d'expériences réelles.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.07)' }}>
              <AttachMoneyIcon sx={{ color: '#059669', fontSize: 32, mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1F2937', mb: 0.5 }}>Gratuit</Typography>
              <Typography sx={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Aucun frais, accès libre.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 
