// src/modules/categories/pages/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { getCategories } from '../services/categoryService';

const CategoryCard = ({ category }) => {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    >
                        <FolderOpen size={24} className="text-success" />
                    </div>
                    <div className="d-flex gap-1">
                        <Button variant="link" size="sm" className="text-muted p-1">
                            <Edit size={14} />
                        </Button>
                        <Button variant="link" size="sm" className="text-danger p-1">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>
                <h5 className="fw-bold mb-1">{category.name}</h5>
                <p className="text-muted small mb-3">{category.description}</p>
                <Badge
                    bg={category.is_active ? 'success' : 'secondary'}
                    className="fw-normal"
                    style={{
                        color: category.is_active ? '#15803d' : '#6b7280',
                        backgroundColor: category.is_active ? '#dcfce7' : '#f3f4f6'
                    }}
                >
                    {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </Card.Body>
        </Card>
    );
};

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCategories();
                if (res.success) setCategories(res.data);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Categories</h4>
                    <p className="text-muted small mb-0">Manage item categories</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Add Category
                </Button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="d-flex align-items-center justify-content-center p-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Row className="g-4">
                    {categories.map((category) => (
                        <Col sm={6} lg={4} xl={3} key={category.id}>
                            <CategoryCard category={category} />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default CategoriesPage;
