-- Recursive Function to get effective permissions for a user
-- This function traverses the role hierarchy (upwards) and collects all permissions.

CREATE OR REPLACE FUNCTION get_effective_permissions(p_user_id uuid)
RETURNS TABLE (scope varchar) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE role_hierarchy AS (
    -- Base Case: Direct roles of the user
    SELECT r.id, r.parent_role_id
    FROM roles r
    JOIN user_roles ur ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    
    UNION ALL
    
    -- Recursive Step: Find parents of the found roles
    SELECT parent.id, parent.parent_role_id
    FROM roles parent
    JOIN role_hierarchy child ON child.parent_role_id = parent.id
  )
  -- Select permissions from all accumulated roles in the hierarchy
  SELECT DISTINCT p.scope
  FROM role_permissions rp
  JOIN permissions p ON p.id = rp.permission_id
  JOIN role_hierarchy rh ON rh.id = rp.role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TODO 
-- Must be inmutable/stable
-- Must use SQL language