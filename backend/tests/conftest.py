"""Isola a suíte do banco real: define DATABASE_PATH temporário ANTES de qualquer import de `app`.

Sem isto, os testes (que chamam `repository.clear()`) apagariam os dados do arquivo
`backend/data/cantinho_das_cores.sqlite3` de quem os executa.
"""
import os
import tempfile

_TMP_DIR = tempfile.mkdtemp(prefix="cantinho_testes_")
os.environ["DATABASE_PATH"] = os.path.join(_TMP_DIR, "testes.sqlite3")
os.environ["APP_ENV"] = "development"
os.environ.setdefault("JWT_SECRET", "segredo-somente-para-testes-0123456789abcdef")
os.environ.setdefault("ADMIN_API_KEY", "chave-admin-somente-para-testes-0123456789")


def pytest_sessionfinish(session, exitstatus):
    import shutil

    shutil.rmtree(_TMP_DIR, ignore_errors=True)
