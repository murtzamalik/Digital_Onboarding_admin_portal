import { Box, Typography } from '@mui/material'

type PageStubProps = {
  title: string
}

export function PageStub({ title }: PageStubProps) {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 3,
      }}
    >
      <Typography variant="h6" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Placeholder — replace with real content.
      </Typography>
    </Box>
  )
}
