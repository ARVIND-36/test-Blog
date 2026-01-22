from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User, Blog, Question, Comment, QuestionVote, CommentVote, Tag
from app import db


def register_routes(app):

    @app.route("/")
    def home():
        return "<h1>Welcome to StudentHub!</h1>"

    @app.route("/signup", methods=["POST"])
    def signup():
        data = request.json
        hashed = generate_password_hash(data["password"])
        user = User(
            username=data["username"],
            email=data["email"],
            password=hashed
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User created"})

    @app.route("/login", methods=["POST"])
    def login():
        data = request.json
        user = User.query.filter_by(email=data["email"]).first()
        if user and check_password_hash(user.password, data["password"]):
            login_user(user)
            return jsonify({"message": "Login success"})
        return jsonify({"message": "Invalid credentials"}), 401

    @app.route("/logout")
    def logout():
        logout_user()
        return jsonify({"message": "Logged out"})

    # -------------------- Blog Routes --------------------

    @app.route("/blogs", methods=["POST"])
    @login_required
    def create_blog():
        data = request.json
        blog = Blog(
            title=data["title"],
            content=data["content"],
            user_id=current_user.id
        )
        db.session.add(blog)
        db.session.commit()
        return jsonify({"message": "Blog created"})

    @app.route("/blogs", methods=["GET"])
    def get_blogs():
        blogs = Blog.query.all()
        return jsonify([
            {
                "id": b.id,
                "title": b.title,
                "content": b.content,
                "author": b.author.username
            } for b in blogs
        ])

    @app.route("/blogs/<int:id>", methods=["GET"])
    def get_blog(id):
        blog = Blog.query.get_or_404(id)
        return jsonify({
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "author": blog.author.username
        })

    @app.route("/blogs/<int:id>", methods=["PUT"])
    @login_required
    def update_blog(id):
        blog = Blog.query.get_or_404(id)
        if blog.user_id != current_user.id:
            return jsonify({"message": "Forbidden"}), 403
        data = request.json
        blog.title = data.get("title", blog.title)
        blog.content = data.get("content", blog.content)
        db.session.commit()
        return jsonify({"message": "Blog updated"})

    @app.route("/blogs/<int:id>", methods=["DELETE"])
    @login_required
    def delete_blog(id):
        blog = Blog.query.get_or_404(id)
        if blog.user_id != current_user.id:
            return jsonify({"message": "Forbidden"}), 403
        db.session.delete(blog)
        db.session.commit()
        return jsonify({"message": "Blog deleted"})

    # -------------------- Question Routes --------------------

    @app.route("/questions", methods=["POST"])
    @login_required
    def create_question():
        data = request.json
        q = Question(
            title=data["title"],
            description=data["description"],
            user_id=current_user.id
        )
        db.session.add(q)
        db.session.commit()
        return jsonify({"message": "Question posted"})

    @app.route("/questions", methods=["GET"])
    def get_questions():
        questions = Question.query.all()
        return jsonify([
            {
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "author": q.author.username
            } for q in questions
        ])

    @app.route("/questions/<int:id>", methods=["GET"])
    def get_question(id):
        q = Question.query.get_or_404(id)
        return jsonify({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "author": q.author.username
        })

    @app.route("/questions/<int:id>", methods=["PUT"])
    @login_required
    def update_question(id):
        q = Question.query.get_or_404(id)
        if q.user_id != current_user.id:
            return jsonify({"message": "Forbidden"}), 403
        data = request.json
        q.title = data.get("title", q.title)
        q.description = data.get("description", q.description)
        db.session.commit()
        return jsonify({"message": "Question updated"})

    @app.route("/questions/<int:id>", methods=["DELETE"])
    @login_required
    def delete_question(id):
        q = Question.query.get_or_404(id)
        if q.user_id != current_user.id:
            return jsonify({"message": "Forbidden"}), 403
        db.session.delete(q)
        db.session.commit()
        return jsonify({"message": "Question deleted"})

    # -------------------- Comment Routes --------------------

    @app.route("/questions/<int:qid>/comments", methods=["POST"])
    @login_required
    def add_comment(qid):
        data = request.json
        comment = Comment(
            content=data["content"],
            user_id=current_user.id,
            question_id=qid,
            parent_id=data.get("parent_id")
        )
        db.session.add(comment)
        db.session.commit()
        return jsonify({"message": "Comment added"})

    @app.route("/questions/<int:qid>/comments", methods=["GET"])
    def get_comments(qid):
        comments = Comment.query.filter_by(
            question_id=qid, parent_id=None
        ).all()

        def serialize(c):
            return {
                "id": c.id,
                "content": c.content,
                "author": c.author.username,
                "replies": [serialize(r) for r in c.replies]
            }

        return jsonify([serialize(c) for c in comments])

    @app.route("/comments/<int:id>", methods=["PUT"])
    @login_required
    def update_comment(id):
        c = Comment.query.get_or_404(id)
        if c.user_id != current_user.id:
            return jsonify({"message": "Forbidden"}), 403
        data = request.json
        c.content = data.get("content", c.content)
        db.session.commit()
        return jsonify({"message": "Comment updated"})

    @app.route("/comments/<int:id>", methods=["DELETE"])
    @login_required
    def delete_comment(id):
        c = Comment.query.get_or_404(id)
        if c.user_id != current_user.id:
            return jsonify({"message": "Forbidden"}), 403
        db.session.delete(c)
        db.session.commit()
        return jsonify({"message": "Comment deleted"})

    # -------------------- Vote Routes --------------------

    @app.route("/questions/<int:id>/vote", methods=["POST"])
    @login_required
    def vote_question(id):
        data = request.json
        value = data.get("value")  # +1 or -1
        if value not in [1, -1]:
            return jsonify({"message": "Invalid vote value"}), 400

        existing = QuestionVote.query.filter_by(
            user_id=current_user.id, question_id=id
        ).first()

        if existing:
            if existing.value == value:
                # Remove vote (toggle off)
                db.session.delete(existing)
                db.session.commit()
                return jsonify({"message": "Vote removed"})
            else:
                # Change vote
                existing.value = value
                db.session.commit()
                return jsonify({"message": "Vote changed"})
        else:
            vote = QuestionVote(user_id=current_user.id, question_id=id, value=value)
            db.session.add(vote)
            db.session.commit()
            return jsonify({"message": "Vote recorded"})

    @app.route("/questions/<int:id>/votes", methods=["GET"])
    def get_question_votes(id):
        votes = QuestionVote.query.filter_by(question_id=id).all()
        score = sum(v.value for v in votes)
        return jsonify({"score": score, "total_votes": len(votes)})

    @app.route("/comments/<int:id>/vote", methods=["POST"])
    @login_required
    def vote_comment(id):
        data = request.json
        value = data.get("value")  # +1 or -1
        if value not in [1, -1]:
            return jsonify({"message": "Invalid vote value"}), 400

        existing = CommentVote.query.filter_by(
            user_id=current_user.id, comment_id=id
        ).first()

        if existing:
            if existing.value == value:
                db.session.delete(existing)
                db.session.commit()
                return jsonify({"message": "Vote removed"})
            else:
                existing.value = value
                db.session.commit()
                return jsonify({"message": "Vote changed"})
        else:
            vote = CommentVote(user_id=current_user.id, comment_id=id, value=value)
            db.session.add(vote)
            db.session.commit()
            return jsonify({"message": "Vote recorded"})

    @app.route("/comments/<int:id>/votes", methods=["GET"])
    def get_comment_votes(id):
        votes = CommentVote.query.filter_by(comment_id=id).all()
        score = sum(v.value for v in votes)
        return jsonify({"score": score, "total_votes": len(votes)})

    # -------------------- Search Routes --------------------

    @app.route("/search", methods=["GET"])
    def search():
        q = request.args.get("q", "")
        if not q:
            return jsonify({"message": "Query parameter 'q' required"}), 400

        # Search questions
        questions = Question.query.filter(
            Question.title.ilike(f"%{q}%") | Question.description.ilike(f"%{q}%")
        ).all()

        # Search blogs
        blogs = Blog.query.filter(
            Blog.title.ilike(f"%{q}%") | Blog.content.ilike(f"%{q}%")
        ).all()

        return jsonify({
            "questions": [
                {"id": x.id, "title": x.title, "author": x.author.username}
                for x in questions
            ],
            "blogs": [
                {"id": b.id, "title": b.title, "author": b.author.username}
                for b in blogs
            ]
        })

    # -------------------- Tag Routes --------------------

    @app.route("/tags", methods=["GET"])
    def get_tags():
        tags = Tag.query.all()
        return jsonify([{"id": t.id, "name": t.name} for t in tags])

    @app.route("/tags", methods=["POST"])
    @login_required
    def create_tag():
        data = request.json
        name = data.get("name", "").lower().strip()
        if not name:
            return jsonify({"message": "Tag name required"}), 400
        existing = Tag.query.filter_by(name=name).first()
        if existing:
            return jsonify({"message": "Tag already exists", "id": existing.id})
        tag = Tag(name=name)
        db.session.add(tag)
        db.session.commit()
        return jsonify({"message": "Tag created", "id": tag.id})

    @app.route("/questions/<int:id>/tags", methods=["POST"])
    @login_required
    def add_tag_to_question(id):
        q = Question.query.get_or_404(id)
        data = request.json
        tag_name = data.get("tag", "").lower().strip()

        # Find or create tag
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)

        if tag not in q.tags:
            q.tags.append(tag)
            db.session.commit()
            return jsonify({"message": f"Tag '{tag_name}' added"})
        return jsonify({"message": "Tag already on question"})

    @app.route("/questions/<int:id>/tags", methods=["GET"])
    def get_question_tags(id):
        q = Question.query.get_or_404(id)
        return jsonify([{"id": t.id, "name": t.name} for t in q.tags])

    @app.route("/tags/<string:name>/questions", methods=["GET"])
    def get_questions_by_tag(name):
        tag = Tag.query.filter_by(name=name.lower()).first_or_404()
        return jsonify([
            {"id": q.id, "title": q.title, "author": q.author.username}
            for q in tag.questions
        ])
