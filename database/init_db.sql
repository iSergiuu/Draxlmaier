CREATE TABLE DEPARTMENT(
dept_id SERIAL PRIMARY KEY,
name VARCHAR(50) NOT NULL
);

CREATE TABLE EMPLOYEE(
empl_id SERIAL PRIMARY KEY,
name VARCHAR(50) NOT NULL,
email VARCHAR(50) NOT NULL,
role VARCHAR(50) NOT NULL,
dept_id INT NOT NULL REFERENCES DEPARTMENT(dept_id)
);

ALTER TABLE DEPARTMENT
ADD COLUMN responsible_empl_id INT NOT NULL REFERENCES EMPLOYEE(empl_id);

CREATE TABLE ASSET(
asset_id SERIAL PRIMARY KEY,
name VARCHAR(50) NOT NULL,
serial_number VARCHAR(20) NOT NULL,
empl_id INT NOT NULL REFERENCES EMPLOYEE(empl_id)
);

CREATE TABLE COMPLAINT(
complaint_id SERIAL PRIMARY KEY,
title VARCHAR(50) NOT NULL,
description TEXT NOT NULL,
status VARCHAR(20) NOT NULL,
asset_id INT NOT NULL REFERENCES ASSET(asset_id),
empl_id INT NOT NULL REFERENCES EMPLOYEE(empl_id)
);

CREATE TABLE COMPLAINT_COMMENT(
comment_id SERIAL PRIMARY KEY,
complaint_id INT NOT NULL REFERENCES COMPLAINT(complaint_id),
empl_id INT NOT NULL REFERENCES EMPLOYEE(empl_id),
message TEXT NOT NULL,
created_at TIMESTAMP NOT NULL
);

CREATE TABLE COMPLAINT_WORKFLOW(
workflow_id SERIAL PRIMARY KEY,
complaint_id INT NOT NULL REFERENCES COMPLAINT(complaint_id),
empl_id INT NOT NULL REFERENCES EMPLOYEE(empl_id),
old_status VARCHAR(50),
current_status VARCHAR(50) NOT NULL,
changed_at TIMESTAMP NOT NULL
);




ALTER TABLE employee 
ADD CONSTRAINT check_role CHECK (role IN ('USER', 'DEPT_RESPONSIBLE', 'ADMIN'));

ALTER TABLE DEPARTMENT ALTER COLUMN responsible_empl_id DROP NOT NULL;

INSERT INTO DEPARTMENT (name) VALUES
('IT'),
('HR');

INSERT INTO EMPLOYEE (name, email, role, dept_id) VALUES
('Ciolan Andrei', 'ciolan.andrei@gmail.com', 'ADMIN', 1),
('Iriminescu Liviu', 'iriminescu.liviu@gmail.com', 'DEPT_RESPONSIBLE', 2),
('Chira Sergiu', 'chira.sergiu@gmail.com', 'USER', 1);

UPDATE DEPARTMENT SET responsible_empl_id = 1 WHERE dept_id = 1;
UPDATE DEPARTMENT SET responsible_empl_id = 2 WHERE dept_id = 2;

ALTER TABLE DEPARTMENT ALTER COLUMN responsible_empl_id SET NOT NULL;





INSERT INTO ASSET (name, serial_number, empl_id) VALUES
('Laptop Dell XPS 15', 'DXL-2024-0891', 3),
('iPhone 14 Pro', 'APL-2023-4521', 2);

INSERT INTO COMPLAINT (title, description, status, asset_id, empl_id) VALUES
('Laptopul nu porneste', 'Dupa ultimul update, laptopul nu se mai aprinde.', 'NEW', 1, 3);

INSERT INTO COMPLAINT_COMMENT (complaint_id, empl_id, message, created_at) VALUES
(1, 3, 'Am incercat sa il tin in priza 2 ore, dar tot nu primeste curent.', CURRENT_TIMESTAMP);

INSERT INTO COMPLAINT_WORKFLOW (complaint_id, empl_id, old_status, current_status, changed_at) VALUES
(1, 3, NULL, 'NEW', CURRENT_TIMESTAMP);

