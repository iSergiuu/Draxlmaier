-- ============================================================
--  ASSET COMPLAINT HUB — Schema PostgreSQL 
--  Proiect: Dräxlmaier IT Day 2026
-- ============================================================

-- Activarea extensiei pentru UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- FUNCȚIE: Actualizare automată updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================================
-- FUNCȚIE: Înregistrare automată în complaint_workflow
--          la orice schimbare de status pe complaints
-- [ÎMBUNĂTĂȚIRE #1] — Trigger automat de audit al statusului
--
-- IMPORTANT pentru backend:
--   Înainte de orice UPDATE pe complaints.status_id, executați
--   în aceeași tranzacție:
--     SET LOCAL app.current_user_id = '<uuid-ul userului logat>';
--   Fără această linie, triggerul va folosi author_id ca fallback.
-- ============================================================
CREATE OR REPLACE FUNCTION log_complaint_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_changed_by UUID;
BEGIN
    IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN

        -- Citim cine face schimbarea din variabila de sesiune setată de backend
        -- SET LOCAL app.current_user_id = '<uuid>' trebuie apelat de backend
        -- înainte de UPDATE, în aceeași tranzacție
        BEGIN
            v_changed_by := current_setting('app.current_user_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            -- Fallback dacă backend-ul uită să seteze variabila
            -- (înregistrează autorul plângerii, nu cel care schimbă statusul)
            v_changed_by := NEW.author_id;
        END;

        INSERT INTO complaint_workflow (complaint_id, changed_by_id, old_status_id, new_status_id, comment)
        VALUES (NEW.id, v_changed_by, OLD.status_id, NEW.status_id, 'Schimbare automată de status');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Rolurile utilizatorilor
CREATE TABLE roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Statusurile plângerilor
CREATE TABLE complaint_statuses (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_terminal BOOLEAN     DEFAULT FALSE,  -- TRUE pentru CLOSED, REJECTED, RESOLVED
    sort_order  SMALLINT    DEFAULT 0       -- [ÎMBUNĂTĂȚIRE #2] Ordine afișare în UI/rapoarte
);

-- Departamente
CREATE TABLE departments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    manager_id  UUID,                       -- FK către employees (adăugat după)
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMPTZ                 -- Soft delete
);

-- Angajați
CREATE TABLE employees (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    department_id   UUID        NOT NULL,
    role_id         UUID        NOT NULL,
    is_active       BOOLEAN     DEFAULT TRUE,
    -- [ÎMBUNĂTĂȚIRE #3] Parolă hash pentru autentificare backend
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT fk_employee_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_employee_role FOREIGN KEY (role_id)       REFERENCES roles(id)
);

-- Rezolvarea referinței circulare departments <-> employees
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Asset-uri
CREATE TABLE assets (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    serial_number   VARCHAR(100) UNIQUE NOT NULL,
    -- [ÎMBUNĂTĂȚIRE #4] Câmp pentru categoria asset-ului (LAPTOP, PHONE, PERIPHERAL etc.)
    category        VARCHAR(100),
    assigned_to_id  UUID,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT fk_asset_employee FOREIGN KEY (assigned_to_id) REFERENCES employees(id)
);

-- Plângeri (entitatea centrală)
CREATE TABLE complaints (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- [ÎMBUNĂTĂȚIRE #5] Număr lizibil pentru utilizator (ex: #C-047)
    ticket_number   SERIAL      UNIQUE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT        NOT NULL,
    asset_id        UUID        NOT NULL,
    author_id       UUID        NOT NULL,
    status_id       UUID        NOT NULL,
    -- [ÎMBUNĂTĂȚIRE #6] Angajat responsabil de rezolvare (poate fi diferit de autor)
    assigned_to_id  UUID,
    -- [ÎMBUNĂTĂȚIRE #7] Prioritate plângere (LOW, MEDIUM, HIGH, CRITICAL)
    priority        VARCHAR(20) DEFAULT 'MEDIUM'
                    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    -- [ÎMBUNĂTĂȚIRE #8] Data limită estimată de rezolvare — util pentru rapoarte SLA
    due_date        TIMESTAMPTZ,
    -- [ÎMBUNĂTĂȚIRE #9] Data la care s-a rezolvat efectiv — calcul timp de rezolvare
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT fk_complaint_asset   FOREIGN KEY (asset_id)       REFERENCES assets(id),
    CONSTRAINT fk_complaint_author  FOREIGN KEY (author_id)      REFERENCES employees(id),
    CONSTRAINT fk_complaint_status  FOREIGN KEY (status_id)      REFERENCES complaint_statuses(id),
    CONSTRAINT fk_complaint_handler FOREIGN KEY (assigned_to_id) REFERENCES employees(id)
);

-- Comentarii
CREATE TABLE complaint_comments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID        NOT NULL,
    author_id       UUID        NOT NULL,
    message         TEXT        NOT NULL,
    -- [ÎMBUNĂTĂȚIRE #10] Vizibilitate comentariu: intern (admin/responsabil) sau public (vizibil și angajatului)
    is_internal     BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT fk_comment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author    FOREIGN KEY (author_id)    REFERENCES employees(id)
);

-- Istoricul schimbărilor de status (Audit Trail — imutabil, fără updated_at)
CREATE TABLE complaint_workflow (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID        NOT NULL,
    changed_by_id   UUID        NOT NULL,
    old_status_id   UUID,                   -- NULL pentru prima înregistrare (status inițial)
    new_status_id   UUID        NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wf_complaint   FOREIGN KEY (complaint_id)   REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_wf_author      FOREIGN KEY (changed_by_id)  REFERENCES employees(id),
    CONSTRAINT fk_wf_old_status  FOREIGN KEY (old_status_id)  REFERENCES complaint_statuses(id),
    CONSTRAINT fk_wf_new_status  FOREIGN KEY (new_status_id)  REFERENCES complaint_statuses(id)
);

-- updated_at automat
CREATE TRIGGER trg_upd_dept
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_upd_emp
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_upd_asset
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_upd_complaint
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_upd_comment
    BEFORE UPDATE ON complaint_comments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- [ÎMBUNĂTĂȚIRE #1] Trigger audit status — se înregistrează automat în workflow
-- ATENȚIE: aplicat DUPĂ triggerul de updated_at
CREATE TRIGGER trg_log_complaint_status
    AFTER UPDATE ON complaints
    FOR EACH ROW EXECUTE PROCEDURE log_complaint_status_change();

-- Originale
CREATE INDEX idx_emp_email        ON employees(email)          WHERE deleted_at IS NULL;
CREATE INDEX idx_complaint_status ON complaints(status_id)     WHERE deleted_at IS NULL;
CREATE INDEX idx_asset_serial     ON assets(serial_number)     WHERE deleted_at IS NULL;
CREATE INDEX idx_wf_complaint     ON complaint_workflow(complaint_id, created_at DESC);

-- [ÎMBUNĂTĂȚIRE #11] Indexuri adiționale pentru query-urile frecvente
CREATE INDEX idx_complaint_author   ON complaints(author_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_complaint_asset    ON complaints(asset_id)         WHERE deleted_at IS NULL;
CREATE INDEX idx_complaint_handler  ON complaints(assigned_to_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_comment_complaint  ON complaint_comments(complaint_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emp_dept           ON employees(department_id)     WHERE deleted_at IS NULL;
-- Index pentru rapoarte per prioritate + status
CREATE INDEX idx_complaint_priority ON complaints(priority, status_id) WHERE deleted_at IS NULL;

-- Roluri
INSERT INTO roles (code, description) VALUES
    ('USER',             'Utilizator standard / Angajat'),
    ('DEPT_RESPONSIBLE', 'Responsabil de departament'),
    ('ADMIN',            'Administrator sistem IT');

-- Statusuri (cu ordine de afișare și marcare terminale)
INSERT INTO complaint_statuses (code, is_terminal, sort_order, description) VALUES
    ('NEW',         FALSE, 1, 'Plângere nou înregistrată'),
    ('IN_REVIEW',   FALSE, 2, 'În curs de analiză'),
    ('IN_PROGRESS', FALSE, 3, 'În curs de rezolvare'),
    ('RESOLVED',    TRUE,  4, 'Problemă soluționată'),
    ('CLOSED',      TRUE,  5, 'Închis definitiv'),
    ('REJECTED',    TRUE,  6, 'Respins / Invalid');

-- [ÎMBUNĂTĂȚIRE #12] Departament și admin inițial pentru pornirea aplicației
INSERT INTO departments (id, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'IT'),
    ('00000000-0000-0000-0000-000000000002', 'HR'),
    ('00000000-0000-0000-0000-000000000003', 'Finance');

INSERT INTO employees (id, email, first_name, last_name, department_id, role_id, employee_number, password_hash)
SELECT
    '00000000-0000-0000-0000-000000000010',
    'admin@draexlmaier.com',
    'Admin',
    'System',
    '00000000-0000-0000-0000-000000000001',
    r.id,
    '777',
    -- [NOTĂ] Înlocuiți acest hash cu unul generat de backend înainte de deploy password123
    '$2a$10$kypbnGGCpJ7UQlysnqzJG.6H.dUewn7UPVWA3Ip.E.8U4jlVnFNnu'
FROM roles r WHERE r.code = 'ADMIN';

-- Setare manager departament IT = admin-ul creat
UPDATE departments
SET manager_id = '00000000-0000-0000-0000-000000000010'
WHERE id = '00000000-0000-0000-0000-000000000001';
