# -----------------------------------------------------------------------------
# Augments Dockerfile - Virtual Desktop Environment
# -----------------------------------------------------------------------------

# Base image
FROM ubuntu:22.04

# -----------------------------------------------------------------------------
# 1. Environment setup
# -----------------------------------------------------------------------------
# Set non-interactive installation
ARG DEBIAN_FRONTEND=noninteractive
# Configure display for X11 applications
ENV DISPLAY=:0

# -----------------------------------------------------------------------------
# 2. System dependencies installation
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    # X11 / VNC
    xvfb x11vnc xauth x11-xserver-utils \
    x11-apps sudo software-properties-common \
    # Desktop environment 
    xfce4 xfce4-goodies dbus wmctrl \
    # Display manager with autologin capability
    lightdm \
    # Development tools
    python3 python3-pip curl wget git vim \
    # Utilities
    supervisor netcat-openbsd \
    # Applications
    xpdf gedit xpaint \
    # Libraries
    libxtst-dev \
    # Remove unneeded dependencies
    && apt-get remove -y light-locker xfce4-screensaver xfce4-power-manager || true \
    # Clean up to reduce image size
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /run/dbus && \
    # Generate a machine-id so dbus-daemon doesn't complain
    dbus-uuidgen --ensure=/etc/machine-id

# -----------------------------------------------------------------------------
# 3. Additional software installation
# -----------------------------------------------------------------------------
# Install Google Chrome and Firefox (skip Chrome on ARM64)
RUN apt-get update && apt-get install -y \
    # Install necessary for adding PPA
    software-properties-common apt-transport-https wget gnupg \
    # Install Additional Graphics Libraries
    mesa-utils \
    libgl1-mesa-dri \
    libgl1-mesa-glx \
    # Install Sandbox Capabilities
    libcap2-bin \
    # Install Fonts
    fontconfig \
    fonts-dejavu \
    fonts-liberation \
    fonts-freefont-ttf \
    # Install Chrome dependencies
    libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2 \
    && add-apt-repository -y ppa:mozillateam/ppa \
    && apt-get update \
    && apt-get install -y firefox-esr thunderbird \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && fc-cache -f -v


# Install 1Password based on architecture
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then \
        # Install from APT repository for AMD64
        curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
        gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg && \
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main" | \
        tee /etc/apt/sources.list.d/1password.list && \
        mkdir -p /etc/debsig/policies/AC2D62742012EA22/ && \
        curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | \
        tee /etc/debsig/policies/AC2D62742012EA22/1password.pol && \
        mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22 && \
        curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
        gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg && \
        apt-get update && apt-get install -y 1password && \
        apt-get clean && rm -rf /var/lib/apt/lists/*; \
    elif [ "$ARCH" = "arm64" ]; then \
        # Install from tar.gz for ARM64
        apt-get update && apt-get install -y \
            libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils \
            libatspi2.0-0 libdrm2 libgbm1 libxcb-dri3-0 libxkbcommon0 \
            libsecret-1-0 && \
        apt-get clean && rm -rf /var/lib/apt/lists/* && \
        curl -sSL https://downloads.1password.com/linux/tar/beta/aarch64/1password-latest.tar.gz -o /tmp/1password.tar.gz && \
        # Extract the full 1Password bundle so libraries like libffmpeg.so remain in their expected relative paths
        mkdir -p /opt/1password && \
        tar -xzf /tmp/1password.tar.gz -C /opt/1password --strip-components=1 && \
        # Link the main executable into the global PATH
        ln -sf /opt/1password/1password /usr/bin/1password && \
        chmod +x /opt/1password/1password && \
        # Copy icons to standard locations
        mkdir -p /usr/share/pixmaps /usr/share/icons/hicolor/512x512/apps /usr/share/icons/hicolor/256x256/apps && \
        find /opt/1password -name "*1password*.png" -o -name "*1password*.svg" | while read icon; do \
            if [[ "$icon" == *"512"* ]]; then \
                cp "$icon" /usr/share/icons/hicolor/512x512/apps/1password.png 2>/dev/null || true; \
            elif [[ "$icon" == *"256"* ]]; then \
                cp "$icon" /usr/share/icons/hicolor/256x256/apps/1password.png 2>/dev/null || true; \
            fi; \
            cp "$icon" /usr/share/pixmaps/1password.png 2>/dev/null || true; \
        done && \
        # Clean up temporary files
        rm -rf /tmp/1password.tar.gz && \
        # Update icon cache
        gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true; \
    else \
        echo "1Password is not available for $ARCH architecture."; \
    fi

# Install Visual Studio Code
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then \
        apt-get update && apt-get install -y wget gpg apt-transport-https software-properties-common && \
        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/ms_vscode.gpg && \
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/ms_vscode.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list && \
        apt-get update && apt-get install -y code && \
        apt-get clean && rm -rf /var/lib/apt/lists/* ; \
    elif [ "$ARCH" = "arm64" ]; then \
        apt-get update && apt-get install -y wget gpg && \
        wget -qO /tmp/code_arm64.deb https://update.code.visualstudio.com/latest/linux-deb-arm64/stable && \
        apt-get install -y /tmp/code_arm64.deb && \
        rm -f /tmp/code_arm64.deb && \
        apt-get clean && rm -rf /var/lib/apt/lists/* ; \
    else \
        echo "VSCode is not available for $ARCH architecture."; \
    fi

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip3 install --upgrade pip

# -----------------------------------------------------------------------------
# 4. VNC and remote access setup
# -----------------------------------------------------------------------------
# Install noVNC and websockify
RUN git clone https://github.com/novnc/noVNC.git /opt/noVNC \
    && git clone https://github.com/novnc/websockify.git /opt/websockify \
    && cd /opt/websockify \
    && pip3 install --break-system-packages .

# -----------------------------------------------------------------------------
# 5. Application setup (bytebotd)
# -----------------------------------------------------------------------------
# Copy package files first to leverage Docker cache

# Install dependencies required to build libnut-core and uiohook-napi
RUN apt-get update && \
    apt-get install -y \
        cmake \
        libx11-dev \
        libxtst-dev \
        libxinerama-dev \
        libxi-dev \
        libxt-dev \
        libxrandr-dev \
        libxkbcommon-dev \
        libxkbcommon-x11-dev \
        xclip \
        git build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY ./shared/ /augments/shared/
COPY ./augments-desktop/ /augments/augments-desktop/
WORKDIR /augments/augments-desktop
RUN npm install --build-from-source
RUN npm rebuild uiohook-napi --build-from-source

RUN npm run build

WORKDIR /compile

RUN git clone https://github.com/ZachJW34/libnut-core.git && \
    cd libnut-core && \
    npm install && \
    npm run build:release

# replace /augments-desktop/node_modules/@nut-tree-fork/libnut-linux/build/Release/libnut.node with /compile/libnut-core/build/Release/libnut.node
RUN rm -f /augments/augments-desktop/node_modules/@nut-tree-fork/libnut-linux/build/Release/libnut.node && \
    cp /compile/libnut-core/build/Release/libnut.node /augments/augments-desktop/node_modules/@nut-tree-fork/libnut-linux/build/Release/libnut.node

RUN rm -rf /compile

WORKDIR /augments/augments-desktop

# -----------------------------------------------------------------------------
# 7. User setup and autologin configuration
# -----------------------------------------------------------------------------
# Create non-root user
RUN useradd -ms /bin/bash user && echo "user ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

RUN mkdir -p /var/run/dbus && \
    chmod 755 /var/run/dbus && \
    chown user:user /var/run/dbus

RUN mkdir -p /tmp/augments-screenshots && \
    chown -R user:user /tmp/augments-screenshots

# -----------------------------------------------------------------------------
#  Copy staged system files and keep sane permissions
# -----------------------------------------------------------------------------
# 1. Ensure everything under /augments-desktop/root is owned by root (files + dirs)
# 2. Set *files* to 0644 and *directories* to 0755 so that applications can
#    traverse directories (execute bit!) while keeping the contents read-only.
# 3. Copy the tree to /
RUN chown -R root:root /augments/augments-desktop/root && \
    find /augments/augments-desktop/root -type f -exec chmod 644 {} + && \
    find /augments/augments-desktop/root -type d -exec chmod 755 {} + && \
    find /augments/augments-desktop/root -type f -executable -exec chmod +x {} + && \
    cp -a /augments/augments-desktop/root/. /

RUN chown -R user:user /home/user
RUN chmod -R 755 /home/user

# Create custom augments wallpaper
RUN mkdir -p /usr/share/backgrounds/augments && \
    # Create a simple branded wallpaper using ImageMagick
    apt-get update && apt-get install -y imagemagick && \
    # Create a dark gradient background with augments branding
    convert -size 1920x1080 xc:'#1a1a1a' \
        -fill '#2d2d2d' -draw 'rectangle 0,0 1920,400' \
        -fill '#4a4a4a' -draw 'rectangle 0,400 1920,680' \
        -fill '#ffffff' -pointsize 72 -font DejaVu-Sans-Bold \
        -gravity center -annotate +0-200 'augments' \
        -fill '#888888' -pointsize 24 -font DejaVu-Sans \
        -gravity center -annotate +0-100 'AI Desktop Agent Platform' \
        -fill '#666666' -pointsize 16 -font DejaVu-Sans \
        -gravity center -annotate +0-50 'Powered by Advanced AI Technology' \
        /usr/share/backgrounds/augments/augments-wallpaper.png && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user/Desktop && \
    cp -f /usr/share/applications/firefox.desktop /home/user/Desktop/ && \
    cp -f /usr/share/applications/thunderbird.desktop /home/user/Desktop/ && \
    cp -f /usr/share/applications/1password.desktop /home/user/Desktop/ && \
    cp -f /usr/share/applications/code.desktop /home/user/Desktop/ && \
    cp -f /usr/share/applications/terminal.desktop /home/user/Desktop/ && \
    chmod +x /home/user/Desktop/*.desktop && \
    chown user:user /home/user/Desktop/*.desktop

# Configure XFCE dark theme and custom wallpaper
RUN mkdir -p /home/user/.config/xfce4/xfconf/xfce-perchannel-xml \
    && mkdir -p /home/user/.config/xfce4/xfwm4 \
    && mkdir -p /home/user/.config/xfce4/panel \
    && mkdir -p /home/user/.config/xfce4/terminal \
    && mkdir -p /home/user/.config/gtk-3.0 \
    && mkdir -p /home/user/.config/qt5ct \
    && mkdir -p /home/user/.local/share/applications \
    && mkdir -p /home/user/.local/share/desktop-directories \
    && mkdir -p /home/user/.local/share/icons \
    && mkdir -p /home/user/.local/share/themes \
    && mkdir -p /home/user/.local/share/backgrounds \
    && mkdir -p /home/user/.cache \
    && chown -R user:user /home/user/.config /home/user/.local /home/user/.cache

# Install dark theme packages
RUN apt-get update && apt-get install -y \
    arc-theme \
    papirus-icon-theme \
    adwaita-icon-theme \
    gtk2-engines-murrine \
    gtk2-engines-pixbuf \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create XFCE configuration for dark theme
RUN cat > /home/user/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfce4-desktop" version="1.0">
  <property name="backdrop" type="empty">
    <property name="screen0" type="empty">
      <property name="monitor0" type="empty">
        <property name="workspace0" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/augments/augments-wallpaper.png"/>
        </property>
      </property>
    </property>
  </property>
</channel>
EOF

# Create XFCE window manager configuration for dark theme
RUN cat > /home/user/.config/xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfwm4" version="1.0">
  <property name="general" type="empty">
    <property name="theme" type="string" value="Arc-Dark"/>
    <property name="button_layout" type="string" value="CHM|"/>
    <property name="button_offset" type="int" value="0"/>
    <property name="button_spacing" type="int" value="0"/>
    <property name="show_dock_shadow" type="bool" value="true"/>
    <property name="show_frame_shadow" type="bool" value="false"/>
    <property name="show_popup_shadow" type="bool" value="true"/>
    <property name="use_compositing" type="bool" value="true"/>
  </property>
</channel>
EOF

# Create GTK3 dark theme configuration
RUN cat > /home/user/.config/gtk-3.0/settings.ini << 'EOF'
[Settings]
gtk-theme-name=Arc-Dark
gtk-icon-theme-name=Papirus-Dark
gtk-font-name=Ubuntu 11
gtk-cursor-theme-name=Adwaita
gtk-cursor-theme-size=0
gtk-toolbar-style=GTK_TOOLBAR_BOTH
gtk-toolbar-icon-size=GTK_ICON_SIZE_LARGE_TOOLBAR
gtk-button-images=1
gtk-menu-images=1
gtk-enable-event-sounds=1
gtk-enable-input-feedback-sounds=1
gtk-xft-antialias=1
gtk-xft-hinting=1
gtk-xft-hintstyle=hintfull
EOF

RUN chown -R user:user /home/user/.config

WORKDIR /home/user

# -----------------------------------------------------------------------------
# 8. Port configuration and runtime
# -----------------------------------------------------------------------------
# - Port 9990: augments-desktop and external noVNC websocket
EXPOSE 9990

# Start supervisor to manage all services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf", "-n"]