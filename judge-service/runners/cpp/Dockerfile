FROM gcc:12

# Create a non-root user
RUN useradd -ms /bin/bash judgeuser

# Install dependencies required for judging (time, diffutils for diff, procps for ps)
RUN apt-get update && apt-get install -y bc \
    jq \
    time \
    procps \
    diffutils \
 && rm -rf /var/lib/apt/lists/*

# Set working directory to judgeuser home
WORKDIR /home/judgeuser

# Copy judge script and set permissions
COPY judge.sh .
RUN chmod +x judge.sh && chown judgeuser:judgeuser judge.sh

# Switch to non-root user
USER judgeuser

# Entrypoint runs the judge script by default
ENTRYPOINT ["bash", "./judge.sh"]
