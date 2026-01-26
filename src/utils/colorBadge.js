export const getColorStyle = (color) => {
    if (!color) return { backgroundColor: '#6c757d', color: '#fff' };

    const colorMap = {
        'red': { backgroundColor: '#dc3545', color: '#fff' },
        'blue': { backgroundColor: '#0d6efd', color: '#fff' },
        'sky blue': { backgroundColor: '#0dcaf0', color: '#212529' },
        'green': { backgroundColor: '#198754', color: '#fff' },
        'mint green': { backgroundColor: '#20c997', color: '#212529' },
        'yellow': { backgroundColor: '#ffc107', color: '#212529' },
        'orange': { backgroundColor: '#fd7e14', color: '#fff' },
        'purple': { backgroundColor: '#6f42c1', color: '#fff' },
        'pink': { backgroundColor: '#d63384', color: '#fff' },
        'black': { backgroundColor: '#212529', color: '#fff' },
        'white': { backgroundColor: '#f8f9fa', color: '#212529', border: '1px solid #adb5bd' },
        'gray': { backgroundColor: '#6c757d', color: '#fff' },
        'grey': { backgroundColor: '#6c757d', color: '#fff' },
        'brown': { backgroundColor: '#8b4513', color: '#fff' },
        'cyan': { backgroundColor: '#0dcaf0', color: '#212529' },
        'teal': { backgroundColor: '#20c997', color: '#212529' },
        'silver': { backgroundColor: '#c0c0c0', color: '#212529' },
        'gold': { backgroundColor: '#ffd700', color: '#212529' },
        'maroon': { backgroundColor: '#800000', color: '#fff' },
        'olive': { backgroundColor: '#808000', color: '#fff' },
        'lime': { backgroundColor: '#32cd32', color: '#212529' },
        'aqua': { backgroundColor: '#00ffff', color: '#212529' },
        'navy': { backgroundColor: '#000080', color: '#fff' },
        'fuchsia': { backgroundColor: '#ff00ff', color: '#fff' },
        'orchid': { backgroundColor: '#da70d6', color: '#212529' },
        'tan': { backgroundColor: '#d2b48c', color: '#212529' },
        'indigo': { backgroundColor: '#4b0082', color: '#fff' },
        'ivory': { backgroundColor: '#fffff0', color: '#212529', border: '1px solid #adb5bd' }
    };

    const lowerColor = color.toLowerCase();
    return colorMap[lowerColor] || {
        backgroundColor: color,
        color: '#212529',
        border: '1px solid #dee2e6'
    };
};