from datetime import datetime
from app import db

# --------------------
# User
# --------------------
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)  # Nullable for OAuth users
    email_verified = db.Column(db.Boolean, default=False)
    oauth_provider = db.Column(db.String(50), nullable=True)  # 'github', 'google', or None
    oauth_id = db.Column(db.String(200), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    blogs = db.relationship('Blog', backref='author', lazy=True)
    questions = db.relationship('Question', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)


# --------------------
# OTP Verification
# --------------------
class OTPVerification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False)


# --------------------
# Tag (many-to-many with Question and Blog)
# --------------------
question_tags = db.Table('question_tags',
    db.Column('question_id', db.Integer, db.ForeignKey('question.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

blog_tags = db.Table('blog_tags',
    db.Column('blog_id', db.Integer, db.ForeignKey('blog.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<Tag {self.name}>'


# --------------------
# Blog
# --------------------
class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tags = db.relationship('Tag', secondary=blog_tags, backref=db.backref('blogs', lazy=True))


# --------------------
# Question (Q&A)
# --------------------
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comments = db.relationship('Comment', backref='question', lazy=True)
    tags = db.relationship('Tag', secondary=question_tags, backref=db.backref('questions', lazy=True))


# --------------------
# Comment (threaded)
# --------------------
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)

    replies = db.relationship(
        'Comment',
        backref=db.backref('parent', remote_side=[id]),
        lazy=True
    )
    def __repr__(self):
        return f'<Comment {self.id} by User {self.user_id}>'


# --------------------
# Vote (for questions)
# --------------------
class QuestionVote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Integer, nullable=False)  # +1 or -1
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('user_id', 'question_id', name='unique_question_vote'),)


# --------------------
# Vote (for comments)
# --------------------
class CommentVote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Integer, nullable=False)  # +1 or -1
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('user_id', 'comment_id', name='unique_comment_vote'),)
