# Git 协作流程

## B. 通用开发工作流 (每个成员为每个任务执行)

假设团队成员A要开始一个新功能，比如“用户登录功能”。

1.  **步骤 1：确保本地 `main` 分支最新 (非常重要！)**
    在开始任何新工作之前，都需要从远程仓库拉取最新的 `main` 分支代码，确保自己的工作是基于最新的代码库。

    ```bash
    # 1. 切换到 main 分支
    git switch main

    # 2. 从远程 origin 的 main 分支拉取最新代码
    git pull origin main
    ```

2.  **步骤 2：为新任务创建并切换到新分支**
    分支名称应该具有描述性，通常会包含类型（feature, fix, docs等）和简短描述。

    ```bash
    # 从最新的 main 分支创建并切换到一个名为 feature/user-login 的新分支
    git switch -c feature/user-login
    # 或者使用旧命令: git checkout -b feature/user-login
    ```
    现在，成员A就在 `feature/user-login` 分支上工作了，对这个分支的任何修改都不会影响 `main` 分支或其他成员的分支。

3.  **步骤 3：进行修改、暂存和提交 (清晰地修改和提交)**
    这是成员A在该分支上实际编写代码、修改文件的过程。

    * **进行修改：** 编写用户登录功能的代码，修改相关文件。
    * **查看状态：**
        ```bash
        git status
        ```
        这会显示哪些文件被修改了，哪些是新增的。
    * **暂存更改：** 将你想要包含在下一次提交中的文件添加到暂存区。
        ```bash
        # 添加特定文件
        git add src/components/LoginForm.js src/services/authService.js

        # 或者添加所有已修改和新创建的文件 (在项目根目录下慎用，确保没有不想添加的文件)
        git add .
        ```
    * **提交更改：** 将暂存区的内容提交到本地仓库，并附带清晰的提交信息。
        ```bash
        git commit -m "Feat: Implement basic user login form UI"
        ```
        **清晰的提交信息非常重要！** 遵循一些约定，例如：
        * **类型：** `Feat` (新功能), `Fix` (修复bug), `Docs` (文档), `Style` (代码格式), `Refactor` (重构), `Test` (测试), `Chore` (构建过程或辅助工具的变动)。
        * **简洁描述：** 用现在时态描述做了什么。
        * **例如：**
            * `git commit -m "Fix: Correct password validation logic"`
            * `git commit -m "Docs: Update user authentication guide"`
            * `git commit -m "Refactor: Improve code structure for auth module"`

    * **小步快跑，多次提交：** 鼓励将一个大功能拆分成多个逻辑上独立的小提交，而不是所有工作完成后一次性提交一个巨大的改动。这样更容易追踪历史和回溯。

4.  **步骤 4：将你的分支推送到远程仓库**
    当成员A在本地分支上完成了一部分工作（或全部工作），并且进行了几次提交后，需要将这个新分支推送到远程仓库，这样其他成员才能看到并进行后续的审查。

    ```bash
    # 第一次推送新分支时，需要设置上游 (upstream)
    git push -u origin feature/user-login
    ```
    之后，如果在这个分支上有了新的本地提交，再次推送时只需要：
    ```bash
    git push
    ```

5.  **步骤 5：创建合并请求 (Pull Request / Merge Request)**
    一旦分支被推送到远程仓库 (如 GitHub, GitLab, Bitbucket 等)，成员A就可以在这些平台上为 `feature/user-login` 分支创建一个合并请求（PR 或 MR）。

    * **目标分支：** 通常是 `main` 分支。
    * **源分支：** `feature/user-login`。
    * **填写PR/MR描述：** 清晰地说明这个分支做了什么、解决了什么问题、如何测试等。
    * **指定审查者 (Reviewers)：** 通常会邀请团队的其他成员来审查代码。

6.  **步骤 6：代码审查与讨论**
    其他团队成员（例如成员B）会收到通知，并查看成员A提交的 PR/MR。

    * 他们会检查代码的逻辑、风格、潜在问题等。
    * 在 PR/MR 界面上进行评论和讨论。
    * 如果需要修改，成员A会回到 **步骤 3**，在本地 `feature/user-login` 分支上进行修改、提交，然后再次 `git push`。PR/MR 会自动更新。

7.  **步骤 7：合并分支**
    一旦代码审查通过，并且所有讨论都解决了：

    * 通常由项目的维护者或 PR/MR 的作者（根据团队约定）在远程平台上点击“合并 (Merge)”按钮。
    * 合并后，`feature/user-login` 分支上的所有更改就被整合到了 `main` 分支。

8.  **步骤 8：（可选但推荐）删除已合并的分支**
    合并完成后，特性分支通常就不再需要了。

    * **删除远程分支：** 在远程平台（如 GitHub）的 PR/MR 界面通常会有删除分支的按钮。或者手动：
        ```bash
        git push origin --delete feature/user-login
        ```
    * **删除本地分支：**
        ```bash
        # 1. 切换回 main 分支
        git switch main
        # 2. 确保 main 分支是最新的 (包含了刚刚合并的更改)
        git pull origin main
        # 3. 删除本地特性分支
        git branch -d feature/user-login
        ```
        如果分支还没有完全合并，`-d` 会提示，可以用 `-D` 强制删除 (但要小心)。

## C. 如何处理别人的工作 (例如成员B如何获取成员A合并到main的最新代码)

当成员A的 `feature/user-login` 被合并到 `main` 后，其他成员（包括成员B）需要更新他们本地的 `main` 分支：

```bash
git switch main
git pull origin main
