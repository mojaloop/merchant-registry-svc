import { SimpleGrid, type GridItemProps, Box } from '@chakra-ui/react';

const GridShell = ({ children, ...props }: GridItemProps) => {
    return (
        <Box mt={6} ml={0} minH='lg' px={{ base: 4, md: 6, lg: 8 }} pb={14}>
            <SimpleGrid
                columns={{ base: 1, md: 2 }}
                spacing={2}
                width='full'
                maxWidth="100%"
                {...props}
            >
                {children}
            </SimpleGrid>
        </Box>
    );
};

export default GridShell;
