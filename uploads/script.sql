Create database QuanLyCuocThi
Go

USE [QuanLyCuocThi]
GO
/****** Object:  Table [dbo].[DiemThi]    Script Date: 7/13/2020 9:58:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DiemThi](
	[MaTS] [int] NOT NULL,
	[MaVT] [int] NOT NULL,
	[Diem] [float] NOT NULL,
 CONSTRAINT [PK_DiemThi] PRIMARY KEY CLUSTERED 
(
	[MaTS] ASC,
	[MaVT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DoiThi]    Script Date: 7/13/2020 9:58:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DoiThi](
	[MaDT] [int] NOT NULL,
	[TenDT] [nvarchar](50) NOT NULL,
	[QuocGia] [nvarchar](50) NOT NULL,
	[MauAo] [nchar](10) NULL,
	[SLDK] [int] NOT NULL,
 CONSTRAINT [PK_DoiThi] PRIMARY KEY CLUSTERED 
(
	[MaDT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MonThi]    Script Date: 7/13/2020 9:58:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MonThi](
	[MaMT] [int] NOT NULL,
	[TenMT] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_MonThi] PRIMARY KEY CLUSTERED 
(
	[MaMT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ThiSinh]    Script Date: 7/13/2020 9:58:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ThiSinh](
	[MaTS] [int] NOT NULL,
	[TenTS] [nvarchar](50) NOT NULL,
	[NgaySinh] [date] NOT NULL,
	[MaDT] [int] NOT NULL,
 CONSTRAINT [PK_ThiSinh] PRIMARY KEY CLUSTERED 
(
	[MaTS] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VongThi]    Script Date: 7/13/2020 9:58:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VongThi](
	[MaVT] [int] NOT NULL,
	[MaMT] [int] NOT NULL,
	[ThoiGianThi] [int] NOT NULL,
	[TenVT] [nvarchar](50) NULL,
 CONSTRAINT [PK_VongThi] PRIMARY KEY CLUSTERED 
(
	[MaVT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (1, 1, 100)
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (1, 2, 90)
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (2, 3, 59)
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (2, 4, 40)
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (3, 1, 50)
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (3, 2, 40)
GO
INSERT [dbo].[DiemThi] ([MaTS], [MaVT], [Diem]) VALUES (4, 3, 10)
GO
INSERT [dbo].[DoiThi] ([MaDT], [TenDT], [QuocGia], [MauAo], [SLDK]) VALUES (1, N'Winner', N'Việt Nam', N'Xanh      ', 5)
GO
INSERT [dbo].[DoiThi] ([MaDT], [TenDT], [QuocGia], [MauAo], [SLDK]) VALUES (2, N'Chicken', N'Malaysia', N'Đỏ        ', 4)
GO
INSERT [dbo].[MonThi] ([MaMT], [TenMT]) VALUES (1, N'Toán')
GO
INSERT [dbo].[MonThi] ([MaMT], [TenMT]) VALUES (2, N'Vật Lý')
GO
INSERT [dbo].[ThiSinh] ([MaTS], [TenTS], [NgaySinh], [MaDT]) VALUES (1, N'Nguyễn Văn A', CAST(N'2001-02-25' AS Date), 1)
GO
INSERT [dbo].[ThiSinh] ([MaTS], [TenTS], [NgaySinh], [MaDT]) VALUES (2, N'Trần Văn B', CAST(N'1999-03-23' AS Date), 1)
GO
INSERT [dbo].[ThiSinh] ([MaTS], [TenTS], [NgaySinh], [MaDT]) VALUES (3, N'Perter', CAST(N'1999-02-01' AS Date), 2)
GO
INSERT [dbo].[ThiSinh] ([MaTS], [TenTS], [NgaySinh], [MaDT]) VALUES (4, N'Mary', CAST(N'2000-09-08' AS Date), 2)
GO
INSERT [dbo].[VongThi] ([MaVT], [MaMT], [ThoiGianThi], [TenVT]) VALUES (1, 1, 90, N'Sơ Tuyển')
GO
INSERT [dbo].[VongThi] ([MaVT], [MaMT], [ThoiGianThi], [TenVT]) VALUES (2, 1, 80, N'Vòng Loại')
GO
INSERT [dbo].[VongThi] ([MaVT], [MaMT], [ThoiGianThi], [TenVT]) VALUES (3, 2, 75, N'Bán Kết')
GO
INSERT [dbo].[VongThi] ([MaVT], [MaMT], [ThoiGianThi], [TenVT]) VALUES (4, 2, 75, N'Chung Kết')
GO
ALTER TABLE [dbo].[DiemThi]  WITH CHECK ADD  CONSTRAINT [FK_DiemThi_ThiSinh] FOREIGN KEY([MaTS])
REFERENCES [dbo].[ThiSinh] ([MaTS])
GO
ALTER TABLE [dbo].[DiemThi] CHECK CONSTRAINT [FK_DiemThi_ThiSinh]
GO
ALTER TABLE [dbo].[DiemThi]  WITH CHECK ADD  CONSTRAINT [FK_DiemThi_VongThi] FOREIGN KEY([MaVT])
REFERENCES [dbo].[VongThi] ([MaVT])
GO
ALTER TABLE [dbo].[DiemThi] CHECK CONSTRAINT [FK_DiemThi_VongThi]
GO
ALTER TABLE [dbo].[ThiSinh]  WITH CHECK ADD  CONSTRAINT [FK_ThiSinh_DoiThi] FOREIGN KEY([MaDT])
REFERENCES [dbo].[DoiThi] ([MaDT])
GO
ALTER TABLE [dbo].[ThiSinh] CHECK CONSTRAINT [FK_ThiSinh_DoiThi]
GO
ALTER TABLE [dbo].[VongThi]  WITH CHECK ADD  CONSTRAINT [FK_VongThi_MonThi] FOREIGN KEY([MaMT])
REFERENCES [dbo].[MonThi] ([MaMT])
GO
ALTER TABLE [dbo].[VongThi] CHECK CONSTRAINT [FK_VongThi_MonThi]
GO