"""Add ArchivedGamedInstance

Revision ID: 88c063983197
Revises: 215e6d73ab6a
Create Date: 2020-09-09 15:07:53.299466

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '88c063983197'
down_revision = '215e6d73ab6a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('archived_game_instance',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date_created', sa.DateTime(), nullable=True),
    sa.Column('date_modified', sa.DateTime(), nullable=True),
    sa.Column('hostDomain', sa.String(length=40), nullable=True),
    sa.Column('gameType', sa.String(length=40), nullable=True),
    sa.Column('gamePhase', sa.Integer(), nullable=True),
    sa.Column('gameStart', sa.DateTime(), nullable=True),
    sa.Column('gameEnd', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('archived_game_instance')
    # ### end Alembic commands ###
