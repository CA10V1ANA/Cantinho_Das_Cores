"""Utilitário CLI para backup online e restauração segura do banco SQLite."""
import argparse
import shutil
import sqlite3
from pathlib import Path
from app.core.database import BACKUP_DIR, DB_PATH, create_backup, list_backups


def restore_backup(backup_file: Path, target_db: Path = DB_PATH) -> Path:
    if not backup_file.exists():
        raise FileNotFoundError(f"Arquivo de backup não encontrado: {backup_file}")
    target_db.parent.mkdir(parents=True, exist_ok=True)
    src = sqlite3.connect(backup_file)
    dst = sqlite3.connect(target_db)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    return target_db


def main():
    parser = argparse.ArgumentParser(description="Gerenciador de backups SQLite — Cantinho das Cores")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_create = sub.add_parser("create", help="Cria um novo backup online com rotação automática")
    p_create.add_argument("--dir", default=str(BACKUP_DIR), help="Diretório de destino")
    p_create.add_argument("--keep", type=int, default=None, help="Quantidade máxima de backups mantidos")

    p_list = sub.add_parser("list", help="Lista os backups existentes")
    p_list.add_argument("--dir", default=str(BACKUP_DIR), help="Diretório de backups")

    p_restore = sub.add_parser("restore", help="Restaura um arquivo de backup para o banco principal")
    p_restore.add_argument("file", help="Caminho do arquivo .sqlite3 de backup")

    args = parser.parse_args()
    if args.cmd == "create":
        info = create_backup(target_dir=args.dir, keep_count=args.keep)
        print(f"Backup criado: {info['path']} ({info['size_bytes']} bytes)")
    elif args.cmd == "list":
        for b in list_backups(target_dir=args.dir):
            print(f"{b['filename']} — {b['size_bytes']} bytes — {b['created_at']}")
    elif args.cmd == "restore":
        dest = restore_backup(Path(args.file))
        print(f"Banco restaurado com sucesso em: {dest}")


if __name__ == "__main__":
    main()
