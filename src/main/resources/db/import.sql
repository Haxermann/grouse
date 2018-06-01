

INSERT INTO user (username, password, account_non_expired,
                  credentials_non_expired, account_non_locked, enabled) VALUES (
  'admin@kdrs.no',
  '$2a$10$Gk3cjYgN0GJd04VkG5R8/OxZ.QVuR.ZH.fN.1z9Jqy8wdgiWoDzqq',
   true, true, true, true);
/*
INSERT INTO projects (project_id, file_name, project_name, project_number,
                      username)
VALUES (1, 'kravspec', 'Eksempel kommune kravspec', '1', 'admin@kdrs.no');
*/



INSERT INTO authority (authority_name) VALUES ('ROLE_ADMIN');
INSERT INTO authority (authority_name) VALUES ('ROLE_USER');

INSERT INTO user_authority (username, authority) VALUES ('admin@kdrs.no', 'ROLE_USER');
INSERT INTO user_authority (username, authority) VALUES ('admin@kdrs.no', 'ROLE_ADMIN');



