// src/components/layout/Header.jsx
import { Navbar, Container, InputGroup, Form, Button, Dropdown } from 'react-bootstrap';
import { Menu, Search, Bell, Sun, Moon, LogOut, User } from 'lucide-react';
import { AppUser } from '../../lib';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuToggle }) => {
  const user = AppUser.getInstance();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    AppUser.clear();
    window.location.reload();
  };

  return (
    <Navbar bg={isDark ? 'dark' : 'white'} variant={isDark ? 'dark' : 'light'} className="border-bottom sticky-top py-3">
      <Container fluid className="px-4">
        {/* Mobile Toggle */}
        <Button
          variant="link"
          className="d-lg-none text-secondary p-0 me-3"
          onClick={onMenuToggle}
        >
          <Menu size={24} />
        </Button>

        {/* Search */}
        <div className="d-none d-md-block" style={{ maxWidth: 300, width: '100%' }}>
          <InputGroup>
            <InputGroup.Text className="bg-light border-end-0">
              <Search size={16} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search..."
              className="bg-light border-start-0 ps-0"
            />
          </InputGroup>
        </div>

        {/* Right Actions */}
        <div className="ms-auto d-flex align-items-center gap-3">
          <Button
            variant="light"
            className="rounded-circle d-flex align-items-center justify-content-center p-2"
            onClick={toggleTheme}
            style={{ width: 40, height: 40 }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <Button
            variant="light"
            className="rounded-circle d-flex align-items-center justify-content-center p-2 position-relative"
            style={{ width: 40, height: 40 }}
          >
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle variant="transparent" className="d-flex align-items-center gap-2 border-0 p-0 after-none">
              <div className="d-none d-sm-block text-end">
                <div className="fw-bold small">{user.username || 'User'}</div>
                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{user.role}</div>
              </div>
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                {(user.username || 'U')[0].toUpperCase()}
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 mt-2">
              <Dropdown.Header>My Account</Dropdown.Header>
              <Dropdown.Item href="#profile"><User size={16} className="me-2" /> Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <LogOut size={16} className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
