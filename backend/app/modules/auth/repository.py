"""Repositório SQLite de responsáveis, conforme schema.sql da equipe."""
from dataclasses import dataclass
from app.core.database import connect

@dataclass
class UserRecord:
    id: str
    name: str
    email: str
    password_hash: str
    role: str = "responsible"
    is_guest: bool = False

class SQLiteUserRepository:
    def get_by_email(self, email):
        with connect() as db:
            row = db.execute("SELECT * FROM responsaveis WHERE email = ? COLLATE NOCASE", (email.strip(),)).fetchone()
        return self._record(row) if row else None
    def get_by_id(self, user_id):
        try: key = int(user_id)
        except (TypeError, ValueError): return None
        with connect() as db: row = db.execute("SELECT * FROM responsaveis WHERE id_responsavel = ?", (key,)).fetchone()
        return self._record(row) if row else None
    def add(self, user, accepted_terms=True):
        if not accepted_terms: raise ValueError("terms_not_accepted")
        with connect() as db:
            cur = db.execute("INSERT INTO responsaveis(email, senha, aceito_termo) VALUES (?, ?, 1)", (user.email.strip(), user.password_hash))
            user.id = str(cur.lastrowid)
        return user
    def clear(self):
        from app.modules.auth.security import clear_revoked_tokens, reset_failed_attempts
        with connect() as db: db.execute("DELETE FROM responsaveis")
        clear_revoked_tokens()
        reset_failed_attempts()
    @staticmethod
    def _record(row):
        return UserRecord(str(row['id_responsavel']), row['email'].split('@')[0], row['email'], row['senha'])

repository = SQLiteUserRepository()
