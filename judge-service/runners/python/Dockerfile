FROM python:3.11-slim

# Create non-root user
RUN useradd -ms /bin/bash judgeuser

# Install dependencies (if any needed)
RUN apt-get update && apt-get install -y bc \
    jq \
    time \
    procps \
    diffutils \
 && rm -rf /var/lib/apt/lists/*

# Copy the judge script
COPY judge.sh /home/judgeuser/judge.sh
RUN chmod +x /home/judgeuser/judge.sh && chown judgeuser:judgeuser /home/judgeuser/judge.sh

USER judgeuser
WORKDIR /home/judgeuser
ENTRYPOINT ["/home/judgeuser/judge.sh"]
