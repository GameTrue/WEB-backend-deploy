PGDMP  /                    }         	   courseman    16.8 (Debian 16.8-1.pgdg120+1)    17.4 ;    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16389 	   courseman    DATABASE     t   CREATE DATABASE courseman WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';
    DROP DATABASE courseman;
                     courseman_user    false            �           0    0 	   courseman    DATABASE PROPERTIES     2   ALTER DATABASE courseman SET "TimeZone" TO 'utc';
                          courseman_user    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                     courseman_user    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                        courseman_user    false    6            h           1247    16454    course_level_enum    TYPE     e   CREATE TYPE public.course_level_enum AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);
 $   DROP TYPE public.course_level_enum;
       public               courseman_user    false    6            k           1247    16462    enrollment_status_enum    TYPE     e   CREATE TYPE public.enrollment_status_enum AS ENUM (
    'active',
    'completed',
    'canceled'
);
 )   DROP TYPE public.enrollment_status_enum;
       public               courseman_user    false    6            n           1247    16470    progress_status_enum    TYPE     k   CREATE TYPE public.progress_status_enum AS ENUM (
    'not_started',
    'in_progress',
    'completed'
);
 '   DROP TYPE public.progress_status_enum;
       public               courseman_user    false    6            e           1247    16446    user_role_enum    TYPE     Y   CREATE TYPE public.user_role_enum AS ENUM (
    'student',
    'teacher',
    'admin'
);
 !   DROP TYPE public.user_role_enum;
       public               courseman_user    false    6            �            1259    16529    assignments    TABLE       CREATE TABLE public.assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lesson_id uuid NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    max_score integer DEFAULT 100 NOT NULL,
    deadline timestamp without time zone
);
    DROP TABLE public.assignments;
       public         heap r       courseman_user    false    6    6    6            �            1259    16490 
   categories    TABLE     �   CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description character varying,
    parent_id uuid
);
    DROP TABLE public.categories;
       public         heap r       courseman_user    false    6    6    6            �            1259    16498    courses    TABLE     "  CREATE TABLE public.courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying,
    level public.course_level_enum DEFAULT 'beginner'::public.course_level_enum NOT NULL,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    author_id uuid NOT NULL,
    category_id uuid NOT NULL,
    published boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.courses;
       public         heap r       courseman_user    false    6    6    872    6    872            �            1259    16521    enrollments    TABLE     p  CREATE TABLE public.enrollments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrollment_date timestamp without time zone DEFAULT now() NOT NULL,
    status public.enrollment_status_enum DEFAULT 'active'::public.enrollment_status_enum NOT NULL,
    completion_date timestamp without time zone
);
    DROP TABLE public.enrollments;
       public         heap r       courseman_user    false    6    6    875    6    875            �            1259    16511    lessons    TABLE     p  CREATE TABLE public.lessons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    "order" integer NOT NULL,
    duration integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.lessons;
       public         heap r       courseman_user    false    6    6    6            �            1259    16437 
   migrations    TABLE     �   CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.migrations;
       public         heap r       courseman_user    false    6            �            1259    16436    migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.migrations_id_seq;
       public               courseman_user    false    6    218            �           0    0    migrations_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
          public               courseman_user    false    217            �            1259    16547    progress    TABLE     R  CREATE TABLE public.progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    status public.progress_status_enum DEFAULT 'not_started'::public.progress_status_enum NOT NULL,
    started_at timestamp without time zone,
    completion_date timestamp without time zone
);
    DROP TABLE public.progress;
       public         heap r       courseman_user    false    6    6    878    878    6            �            1259    16609    sessions    TABLE     �  CREATE TABLE public.sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    user_agent character varying,
    ip_address character varying
);
    DROP TABLE public.sessions;
       public         heap r       courseman_user    false    6    6    6            �            1259    16538    submissions    TABLE     I  CREATE TABLE public.submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    assignment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    score integer,
    feedback text,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    graded_at timestamp without time zone
);
    DROP TABLE public.submissions;
       public         heap r       courseman_user    false    6    6    6            �            1259    16477    users    TABLE     �  CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    name character varying NOT NULL,
    role public.user_role_enum DEFAULT 'student'::public.user_role_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    avatar character varying
);
    DROP TABLE public.users;
       public         heap r       courseman_user    false    6    6    869    6    869            �           2604    16440    migrations id    DEFAULT     n   ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
 <   ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
       public               courseman_user    false    218    217    218            �          0    16529    assignments 
   TABLE DATA           ]   COPY public.assignments (id, lesson_id, title, description, max_score, deadline) FROM stdin;
    public               courseman_user    false    224   �O       �          0    16490 
   categories 
   TABLE DATA           F   COPY public.categories (id, name, description, parent_id) FROM stdin;
    public               courseman_user    false    220   BS       �          0    16498    courses 
   TABLE DATA           �   COPY public.courses (id, title, description, level, price, author_id, category_id, published, created_at, updated_at) FROM stdin;
    public               courseman_user    false    221   �S       �          0    16521    enrollments 
   TABLE DATA           g   COPY public.enrollments (id, user_id, course_id, enrollment_date, status, completion_date) FROM stdin;
    public               courseman_user    false    223   ~U       �          0    16511    lessons 
   TABLE DATA           k   COPY public.lessons (id, course_id, title, content, "order", duration, created_at, updated_at) FROM stdin;
    public               courseman_user    false    222   W       �          0    16437 
   migrations 
   TABLE DATA           ;   COPY public.migrations (id, "timestamp", name) FROM stdin;
    public               courseman_user    false    218   a       �          0    16547    progress 
   TABLE DATA           _   COPY public.progress (id, user_id, lesson_id, status, started_at, completion_date) FROM stdin;
    public               courseman_user    false    226   oa       �          0    16609    sessions 
   TABLE DATA           n   COPY public.sessions (id, user_id, token, created_at, expires_at, active, user_agent, ip_address) FROM stdin;
    public               courseman_user    false    227   qc       �          0    16538    submissions 
   TABLE DATA           t   COPY public.submissions (id, assignment_id, user_id, content, score, feedback, submitted_at, graded_at) FROM stdin;
    public               courseman_user    false    225   �x       �          0    16477    users 
   TABLE DATA           `   COPY public.users (id, email, password, name, role, created_at, updated_at, avatar) FROM stdin;
    public               courseman_user    false    219   b}       �           0    0    migrations_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.migrations_id_seq', 2, true);
          public               courseman_user    false    217            �           2606    16444 )   migrations PK_8c82d7f526340ab734260ea46be 
   CONSTRAINT     i   ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);
 U   ALTER TABLE ONLY public.migrations DROP CONSTRAINT "PK_8c82d7f526340ab734260ea46be";
       public                 courseman_user    false    218            �           2606    16537    assignments PK_assignments 
   CONSTRAINT     Z   ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "PK_assignments" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.assignments DROP CONSTRAINT "PK_assignments";
       public                 courseman_user    false    224            �           2606    16497    categories PK_categories 
   CONSTRAINT     X   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_categories" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT "PK_categories";
       public                 courseman_user    false    220            �           2606    16510    courses PK_courses 
   CONSTRAINT     R   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_courses" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT "PK_courses";
       public                 courseman_user    false    221            �           2606    16528    enrollments PK_enrollments 
   CONSTRAINT     Z   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "PK_enrollments" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT "PK_enrollments";
       public                 courseman_user    false    223            �           2606    16520    lessons PK_lessons 
   CONSTRAINT     R   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "PK_lessons" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.lessons DROP CONSTRAINT "PK_lessons";
       public                 courseman_user    false    222            �           2606    16553    progress PK_progress 
   CONSTRAINT     T   ALTER TABLE ONLY public.progress
    ADD CONSTRAINT "PK_progress" PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.progress DROP CONSTRAINT "PK_progress";
       public                 courseman_user    false    226            �           2606    16618    sessions PK_sessions 
   CONSTRAINT     T   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "PK_sessions" PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT "PK_sessions";
       public                 courseman_user    false    227            �           2606    16546    submissions PK_submissions 
   CONSTRAINT     Z   ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT "PK_submissions" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.submissions DROP CONSTRAINT "PK_submissions";
       public                 courseman_user    false    225            �           2606    16487    users PK_users 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_users" PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT "PK_users";
       public                 courseman_user    false    219            �           2606    16620    sessions UQ_sessions_token 
   CONSTRAINT     X   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "UQ_sessions_token" UNIQUE (token);
 F   ALTER TABLE ONLY public.sessions DROP CONSTRAINT "UQ_sessions_token";
       public                 courseman_user    false    227            �           2606    16489    users UQ_users_email 
   CONSTRAINT     R   ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_users_email" UNIQUE (email);
 @   ALTER TABLE ONLY public.users DROP CONSTRAINT "UQ_users_email";
       public                 courseman_user    false    219                        2606    16584 !   assignments FK_assignments_lesson    FK CONSTRAINT     �   ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_assignments_lesson" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.assignments DROP CONSTRAINT "FK_assignments_lesson";
       public               courseman_user    false    3309    222    224            �           2606    16554    categories FK_categories_parent    FK CONSTRAINT     �   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_categories_parent" FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.categories DROP CONSTRAINT "FK_categories_parent";
       public               courseman_user    false    220    3305    220            �           2606    16559    courses FK_courses_author    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_courses_author" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.courses DROP CONSTRAINT "FK_courses_author";
       public               courseman_user    false    219    221    3301            �           2606    16564    courses FK_courses_category    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_courses_category" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;
 G   ALTER TABLE ONLY public.courses DROP CONSTRAINT "FK_courses_category";
       public               courseman_user    false    3305    220    221            �           2606    16579 !   enrollments FK_enrollments_course    FK CONSTRAINT     �   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_enrollments_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT "FK_enrollments_course";
       public               courseman_user    false    3307    221    223            �           2606    16574    enrollments FK_enrollments_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_enrollments_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT "FK_enrollments_user";
       public               courseman_user    false    223    219    3301            �           2606    16569    lessons FK_lessons_course    FK CONSTRAINT     �   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "FK_lessons_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.lessons DROP CONSTRAINT "FK_lessons_course";
       public               courseman_user    false    221    222    3307                       2606    16604    progress FK_progress_lesson    FK CONSTRAINT     �   ALTER TABLE ONLY public.progress
    ADD CONSTRAINT "FK_progress_lesson" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
 G   ALTER TABLE ONLY public.progress DROP CONSTRAINT "FK_progress_lesson";
       public               courseman_user    false    3309    226    222                       2606    16599    progress FK_progress_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.progress
    ADD CONSTRAINT "FK_progress_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.progress DROP CONSTRAINT "FK_progress_user";
       public               courseman_user    false    226    219    3301                       2606    16621    sessions FK_sessions_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_sessions_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.sessions DROP CONSTRAINT "FK_sessions_user";
       public               courseman_user    false    3301    227    219                       2606    16594 %   submissions FK_submissions_assignment    FK CONSTRAINT     �   ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT "FK_submissions_assignment" FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.submissions DROP CONSTRAINT "FK_submissions_assignment";
       public               courseman_user    false    224    3313    225                       2606    16589    submissions FK_submissions_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT "FK_submissions_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.submissions DROP CONSTRAINT "FK_submissions_user";
       public               courseman_user    false    3301    225    219            �   7  x��UKnG\�N�.��d��:DV^j�n�#�D:@��U�8�|�+̻Q8������O7�UC��C�J룁�0�*�i�G�<{N���Jo^
���C�k��(�V-Z�~}sz��ߜ����x7��߿���巯b����/�s�:���)N�1�55��I�tt��y�#�ļ�f΅l�6� 7�Td� ��^Z�S�n�>a	�����=�1��*(G1��E���	|O��{l#Se�d��Qn ��j��HJO�N�7F.��(_r�D�h��$�"A���/To�f����Do�r�AC<U���S3�P5��ƞ��˶������������/�݇�3�_>@����-�n�!Vk�r�����?��>'�Ϩ̴(;��r�cN���l���g�g���������:6�b���������A	����>.N��G�����ww��C	��ē�sh>k�^�C޽M���,c�Na�#�k��b`:���F{��s+UC��x��vutɠ����A8��M�HnO`#~tZ�'��SV9�<��B�0#��t-�
E�)�5qͭϙ\I�zjѣx:ɀ�E����G���ˇ��s��BƘ�脺�j����\���<�i��@o�!�Hŕ�u�$$��5h-j���^$Q���5��3���i�kHm�ޡ�"ܲd��Lh��S��mF	hc��2ǜSk�l�'i].GЌ���Ṓ�����3�ٵ�TB��0+����D��BZ�y�6�	E����QA2՘w�G�����y�(�:�������)��^eNLT�y�W_]\\���(�      �   �   x�35523MN�ԵLL5�5I1��MJ25�524�L34OM443�0�bÅ}6�� �0���[9=C8c���LR��Lt���fY$��Z&'�&���$&����p�$�$���&�e楃y��D��+F��� ��<      �   �  x���=r�0Fk���  A�FR�!	���ڌV�����lj�����3pnT��m>"�o5��Q�Z��Χ�ܯ?����\��˾��`p�4�����ы�Ѳ*u���h[��bBKE��o��V�4��{��L�bY���?DTV�K�@8qгV/�GuRz�-#$k����߳ڭ���ϟ���?�~~���c�}cOC�"���1S�2�m�)��GO�e�l�:����"�*)r�Ɍ�FYi��`��(�},x�!)"�Y�|֭��*[��$}�~�u>��v������RO�@�x7�./a����q��,��S▭h�V�8�F�p?�I��[ qwr�͎㭺��u��@�.(��!(=F�RZ�R��-�4��Ԑ      �   �  x���1�]1E��W�7�`0Ƌ�
���-EJ���?L�|��4.����fQg\@�ۀ6�@ӽe��ʹ�̳�
i�TDh�*+�K�.����ak�SQeo1`aݓ�y1�5
�<	;��xK)֮�_���ˣ���$d�� O�-�p��BQmr�}@�(�,�M>v��X{)7+��?�������ۤOĎ�	o~���53/���X44ȘM?ǊU�(��d�\�f�u��.?�^Y��X�v+V��?juX��J'>�����d@�<3����i�8���xxd��g��I�Ѻ�]���&.Ǫ����`��ur��:��@X�*a�5M�i��2���)u���L��[D*��k-�H�8l�?L���N�E��U�_�������źF      �   �	  x��X[o��~�� /� ���E$�RnS,�`���2$G6�)��U��v�I�t(Зv[�@_E��R���zΙ�.���<�9���3�Eq���M�چ��x�3b�jW<�͚+l3�b�]�q-��H��ͦ�؊��72/XG�y�2~��̚e�2�1��,���4��~󞡝���t�ᚲm8V �v�yzM�
���녖o.N�k��p�7�!#{���b�G��W$��&H��~�5�#0t�Ўsۏ\�f��[��s��Ҵ}�Y�>�D�V�myR^�3V��oX��\���/��;���j줜��.O��d��/���j���U9Z��rCՋi9/g���n�r�`?X5��Q��M�Θ��k�����幚�G�����0gT!�=�`d�� ��������(a�y�!Z��}��8�`�%L�X�Aa�[�fD�a�+5��᪲=�/	:����o��b��h��,_W~M��'�5�%h������d�Rٻ���	l����q	�O��~�_1�
LL25�����ڃ��l�9Ĉ��������B�3�edd���*�����Q�l�Uv�W �lu�ܾ�^���3by���M��<"������(�0Uʙ:,�o��X�P�S�a=�&D��`���	#��˗��{@��	�+?�<� k�TcJ*��,^�����d���Q��`�7("����0�0�G�$���M��b����SH~a�.�U���DWU g��c��1���<Tgw�&fֵ���&@�`By�r��S�/���|�C�:��P��Ì̖����	�{d�F���W	�u{<�̹Ό�ݹΈ_G')��	{k�)��*��uR���E�fT��p`2��jW%C��#j��7ϿyU{[�<f4_U�
�[u��h�@�a��C��fRBod�:n1<���i���}I4]e��Cb���o���{��j�F��KQ��T��[G֝��Ɏ䭉��+�T�Gj�O�x��K]���"�5kSD8�w[����&�??��c�"�A��&J?6bJ�MӲܚ�t�#��� !�exq;�m7�^\{R��/ei��Eβ6���4f�$����n���D�#cEq\g����H�sTE�A��:,?���a�d�I�p�|�yuVdYG�O�bxH��H�,$�x{1(2ZVg �)X7��vO��{�?L����{I!Y�u%�/d.Y$���ކ2I����u�ʺ"IY;���ӽ?�Y,�>����$X�L��~�vagX�g�(�#ɞ%i�s��.��/�E�YY19�V8p�P����JҤ;�6�Um/g��QdhpJ�  9Y���nW��aө�ݯ��$|��8�u�T���UO�{{O����nO����y��C���=LE�k�!=߬}�"?fI�Qh�{":� ��Ɇ�79����v7b�dC[�b�ǩ�* :�bOE�J��Ecu6<H��d ;��-�I'��#���Г$��rȁ�d�@C��^6�������`��A��L�c��΀ܡtM����*�� k����CW%d"|�M��Aa@ �1mЗ�W<������X��j�_���Y�Y��J��g�ŁH�m�&p/\\���K�:�ǐ�4��Y.%����$.�ү��l�N���)Qy�e��:cc8�IH̨��P���G���{]�U�<��=Ȣ�DBb�EY֫�F�A� ��}��o�*d`+�@��2ҥ1Xϣ�C�	o@+Ʒ�Qh��f�t��7]랡� �l)�0�����
=CD<6,7qdz�p��:H���#x3�#���n�ݬ�t���+�"F���3��f�Q�6M�!�y��VX�{��Q7�'���p�����G�v�[���0�����{y1�S>��e�4μR>�wz	��p��F^Pw�*�qR@m�� ��	����~�5�\�%�g���|y��mݝ�� �	}�`M���W��HÛ�}<�ׯn�����Z������v��R�I�](}���ZC1@�~��O7�ϠCP���5�D:�^;��G��BǑzĊ�P�+a��	��S���C�̔���`J�1_>ꈠtB�Vm������6�Tt	O�抂������4Q��-�h��I�(���t�\kM�@�V��P�J]a��Hm��V@(��w��&���������tǟ,0_��n=/����D�w{�P4��Q�7����U�5Řl����D��BL�J�k�H4�]�֯/#vWk��O����7�2 a�,�:-�a������cׄ�3<ϗp&J���i�6,;6y�D�u&ڵB�E�W������-��r���s(hq���Y�N$#.�miH��'�!xlN��n�n����AC$̩iHNmoY~��M��L����f�y��}�j�@�َ���6Ӳb'pC�5kM�W�G ;�`�m�mچ����"/��`���C��S��I	���gqƁN�����{�v�7vvv����      �   M   x�3�4474�41��0532�t.JM,I���,�L�	N�H�MDQ�e�`j ��))���ř�y�!�I9�(�\1z\\\ $�_      �   �  x���[�\1D���b6��$�a�Ed� �B �a��w����|��qU��(�;X�L�VU,�Kjl��T���B� ���Az�6�n2�Ԯ	��@�*��\K%g*q�?��~���1�
���]��Y�>ҏ��Y$ �:�FBc�=�*o��&���T2���_S�F�AIb��0	o�{�I	#���搝���S�=P}�r!^�gx<�\Nl��� 1+��	�Q2F,���!}(��)��F����1�CPƫ𩪏��Q3OCp��۬�@�,:E��@���rg:�?�\L���V�6��M�ro�UH�;_7�<*��s��>unGw5��nk��Ǡ�^���ۗ�^�~|~�?����iW�ӫ����G�0NE���w��D��ytn_��s�}vJ[f�
ҩA��9U�k�}z��{�U����������{ ��toP'�b�F���sTu���pp�{H��]�Zh��ԥ?Hz{���Yk�[g�X����y�o�a�      �      x��\ˎc�q]������d�2#9+������ɧ���#�[���$���d�;�S�*XD�s#��Ž��gPI-��j�+2ϩU*��V3]���"�)��<R�YԆZ%���՘l��hq,)mQ�<��D��s&�buT�lYlִ:��đ-D�^b�0_$�cL��s��6��u��������7v�/�����������/�7|��$����I����w�w���㟾1�gI/���?�����7/�}��|������/_��?~��?�7$����˿�U����������r��-
T�F�8T\t�B]�w���f[�(i(�X�Il�+�S�܌4�6f�^s�/flsV��[.Bj��V�V'.�L����r�tȹ�[��!?�����o>ġ>�R�;Ŵ7v�[���Γ|j�!ې�̫E�!�&�R����S�
0r��E��2��\�ܗ/ji�؊ ms�3iQ�U��Ή�@�|��b��\o ���_�e�:�3*��l��8u��|���Emƒ��ZO@��;�YZ����Gҥ�Q���䔇������ZQ�:'�%i[�s���i-�ҽ}d���C�_H�Y(�C��Hµ���߮��<�)������(��`�(3��*8e�=q�X)YjYk��@�S_c���B���G�)�8�,�Y�H#�5:*/d����L9
�!�^ȯ�tN���<�J��y�`�xp��<Ӳ*'ZÒD	�An�����l3W_H��H��t����X��R.&�F����d��Bw���it�DF�z��oJ8��!?�� c'�-�D���{AvU�b�p?V�<V�*�岬�F�pkT�&��X�m��i���2����Ի�I��ŤI�R�-�|�X����?h��� z��P�5���X�R�K���y5|��;(�M�F���G���D�d�8 G�z�\�WtS��ta�(�RK.tf�����c�J�(�9� J0xk��(ˎ2N�S�$
�):b���.+xi
މ+u ������Вڦආ�dҹ�<�QB8Z'�u�7I��[:2])E/�׆.rK�~b?��0�߾��?
񗟰�w.�^���s}��o���#��g�0R��1٢k��Z/�V��Wz4��43��Q�ͅ8�	;�<͑l4��hM�5.����R��YD�"�/A�-<o��|��UJ�:8����QI��ZJ�A���*f�Ķ�z���g�a�7���� pZ��H�ric/@t�2v��b|�(_[�����CO	JΥ��2��:�r�]�3�䩕�*.�����ɐ�d��*H��P	���'�H\�Y��&�@'��wkS7�=�p��BD�ꦙ�p#^���җ����3������݆�g�χ�_����w?�C��0�⧤�&����V�{��N�P�ySb-Dq6�Y�	ü���,�~N�WgT������>�Ks���
\�Ϭ�Q� r�$�sn}�;��{VN�Z��A����X�o�
�����40Eg��K��%^�\ g���T�A��D�
��f�3�7����r� �,�>�&=�&�T�]��4�ـaH90C(-O�.��Ԏ�%W��SF2J1���#�\tc�*������\���U_�g��ܦK���sq�N�C[n�5�`�.��/@�n�T�{��<+5���ɍՎ.Ƌ���]��NYT�B@�ZK�k�c�m���8���Bf�&��T�y���2N.q϶`��ְ0��$���pgKJ�*�+ 'F 9�9&�������\�hVG�Bm�h-	���If���+�<�z2�þ@�A�?��v���d��88|=���"�TqYR���9�ǰŸD�t�8��1��6������f	 Y�%�;4�A �`;���A����6��*��q��)$��|`t'x5��30l`�]�ۼ�:��k��f��E�W�o� i�s�U�ͮ�9�����u�3�����%��,���s���܃�Q�{� ���n� 3��v�\Wh�qB�I(�>Z��E ��X���rjH��f�&�hF(r�e}�EDqK�:
�y�Z��>�Й�	��Y�UtG������i�U�䱁l)YQ��.�y�s
���p�$��>���#���� �ĉ�+�H�қ�l��2�P� (�!(v����\�/�%��@.;!�����Wl�@�\�7LhΦhH��}�t�5�,�j�� �n� `n��.Aړr���J桸�.��X��av�9�w�|���䯟�?� ��&ȹ�IP��}�Cc��R�<"���5��M\���Q��5aD�����#<%@�C����D
$"ޜgb��Yz�X�ൻ=�� }�u� �k(��	�RW���Dܞ 퐮u�Q<m�SG�<6�ʺC=Mؒ�p�)WhC�q�������Mh�K�>��4������8��=ĆO�C���ןyQ-K��C��E���?"-�9����dso���h.8�ږ$���jY'����Y�>Qс�����\4���|���B���vg�j���zHs��r$�D�"����1�A	��=�y��m�8ffP�9�u������zm�ݳ>���i�ky�����x6��r3�,4Lp``^��>�.�wic�2*�����Li�LQ���J}��gA���6}O�o��+�Ƌ2�s�(x�ې�/(!���%MC��	��Z[����y�8��!�bh|����&� ǝ+� �Bd��3��~���g+
���_��9�Z%qI�p�n(��iW��s��f�1��ܞ_�W3Wѹ5��v�D2�u1���V�s� �8�W*SG�بB<_���X�d�9K��l#�\#7�r~��,�¦�8*|���������=�2����S�q�4��̃�Pz��hz�m��0i��*4Z�ͅ2�C�@I������˹U(tQ�#�Y�f�*��w ���
({R� ���{��59ҶT�+�h�"�����B8̅;����牳�s��4V���}�~!>;�i����5��1���!O��+ TTf(�[ ��+�[MPn�&;�Wl�9�օ�u�5�N�P�ڦ@)�	#�f`�� ���CI:sY1�	��+�V���+����u�J[RG��[dk����E��еl�R�ˇ�?3�@�n�i��4�YT�	{vP��R;�<��NX�yŤ�7-aG��i<2��N�p����A����hO���u{��*�uV��3�\�h�d<�^8D��t;5z�12Z�nP�*15y�9mI��� �,�$-5$8��c�KI�qȺ�`L{�&��t���؟B�V�캾�=����CV��kj��m,�:=x��r^� ,1X�{D(�_�2|�P��Y�ؔU+��.��;_��`��`�O!}��恱���{h{kN�C�������Q��r��~50if8�ڦLxp�Nd�����T�Goy/�%8l{S�oK�vN���a���^�{���Xr)�Q	 D�k�^��!X���Hk@�	W(�w�ű���.Iqt2AQ1u����8�!/8��À��8����-�t�A��C�g)�d@&4���Zh{���=걡u�;${��@-��BqZ�r���ޑ��Y�O^y��H�}X�o��uh����\$�,��m����:�����!�.�a����V�\�3��r�hnu�"�B$�p�	�	~$/�0�R�����q70��؅���>.����Y+__�P"�-��͸7a��P����k5(�c%l<KddoN*��	��Kzq� �\��X;�����½�}�'JV �g�g�n�])�S���]��T��z������ Z�+��%����B� ���O��}��׽a�7{��eB�ܪ����mV��ͪ+�UG�B���a������W�N�5ޘe��E}t^	�)H$
�{��k���������k��Ž7�K��ڌ1�נ��u�&��w��֑��2,K�>�s�_^�P��sLh�wG%��� �  ��9=��]�5��5��pR`����]���b+{��1#$\�
���Ŏ��˸����^@�.�,�}ƹ�-�;�H������p�yzz�>H?h�[���'�Dd��&
L�� <X�i"�R�KF�M��34.Tnj�l�����y˱G���O> ��ې���wÇkn�ʒ�� �(�{H�V�nvȴZ�܍
���w.rY��<����j����ck��ROKth6�=8b���X'�����%�۶~�/w7����g3�3��J��Rܫ�J-��Q��@�H���F)��$v��99��nu�hSm5��dz�rϲ���#�?F���G1����C˒N���mM�ݣAEc���ա�g��=�Ť�_�{�n.��N �LN��ޚ`�vHj}+j����k��c����� 2N��X'Ag�ߍ�H�=66�{l��5W+��mKV�E ��v8�A�X�w)q�����f��	����0�S�}A	E\���*�n�װ/0�G�Ɗ�c�M)6H�J��-��YƧ1�oo�{Ze���a}��P9�/�4����/�����0{Doj�!�rA}{G�f
����sك�pz=&��;�Bsw/��\�|&l��\����I�2m�9����G��/�^C��}���+���T(� J���c�؞=)ps|��9�����\[���r`�휹���݋y�rݾ��3^���ϩ���9�烁k���ʟ0�V��B2^=4`l3�[�u�~,���m?�3�#��W�-m�x���q��W�R���2���`
���a��m�v��=���3���\�}�	�D��G��>"(V�k�U�����ke�)����T�b�>ӷQ4���m���j���^2�'��/�1Y����N�W~�0�s?�i=��p�+�5Z8Tb���8:�e8����?]�Ȟ[ih����f�XpHM]�L���ܳ����%=�ZNwS��}b����`�
פR]=���':+�V��a��|�g�:e?U�(���"��fh�{���-Խ��a���.�{�i�"ȼ��AƎ��~��[��<�iB�2-���`m�
p�l��:��i܃g�}��F�5�ƶ};�$��������H��iJ�A����:�n��m��σo�IQ�J������gT1iHBQ�Q��X沟wF���w0t����c��2�>r?�T�~ℱQi	M!�1d��AH\ �1�.����Ç��_d      �   �  x�����E��٧XrjT]U��1)<���M�L`K�X!R���k��3̾g.�^[�+�fW���N��ڥ��
E����H�����O���e�̃�Q����T�Vr"��f�]_f�6C	4�a��LIz��|7zKy�]����n/��l/�?�O�/����?�_����׋�xb#gG�O�'�V��*'�U\>��Cb��,�F%gO��fqE4�%��6���6�D�%=�8��si)��v�x<z�(/�+ ������v'Ϋ�Kb��5'wh�%?�Rh�ɒLJhC�6��,����O�:��Y�����D搒�uğ}|\}y�Կn7ۛ������B��2���iՔ/�=��򡻰#T�>6�Q���F�j��-���h�A[��e�6���k������%�-f����`5ʜ<($$�Z��@2RT��jmq5�(��x!.�3�V9�*��]G��:?�~_�\#��r��f{}��.��k���p�żj��s旅�N��A̩�N�
�v�]xyNĵR����\���)�RFv	i�����~��R[{�:����U��	9f�?���>T[����M��A�K ���:HTTKo��k��n��h϶��Y�O�4n���������O������'�Մ����d���:f�;ն��J9OOC�����G<�QI{��x�0+�>�S�x���W��(K'�k`�;�m��m��Y��u�(����b�hɖ؃J�N�Q�fE)_i����~o�����yyR�]&�5�|9�O����C@`�C��Q���xTH�cQ��hl��S��"Ex�{�|����B���lW�wkL�
�-jD@��S��n�����-f�����y_�@�9S���hɊ�#��^��'<�*�R<�2:��9�K���^��
w�ui��DT���M,*'�&f��ܕ�ꃡ��5�n�+:�$l����yL*y���R�\�WR6��/�XP}i���(�t����>q�{H�BM�(��=��K�È5Mţ�\u>�
�	Yֹ�~�F��9����{���n��Lm��pu�	)Y
��X*J��ZI��!����d#�^�čz�ӕY�~P��H����v*�@+��0v�X{���q���ť���*��`,�3�Tz�1pN)���n��ЂY(&�d�Λ��3XKm�(�5x��m)5�ɥы�4��3����MD  �`=��ٷ      �   $  x���KnG���)t�ի_�R6���� FwW�,X$�L��%#�q��#�Hǎ#ق�� �!YÚ����8��Jp�;	 .�W"�W�AsXl�f��׫˫e����z��		Z��)�A=�8(�Ȭ1�m�E 0�S�b�*�S'_�ݼ���s�����!�#�B3�)Q"����9�x�2���������f��h������k��v�l׷�Oo�J��v����ۋ�Sٖ���xĮ�׫��B��w�u�St�p�Pt,i�Ŷo��|�����6�e���C&��P˱1'��#�h�p��f?�2�ޘ0|L�(z��@:8��)3F»pd�|����<f�G8�h�A�$�I��eMŵ�ALI8,����ru���.�����K���YY��dL62c��OQ��0�X��<f�G2���]�qkn��Vv���4b�Z�'�o/�%�X>�_O���k�	�4�@����C}``W��)��+C�q�	z����Q2]wӓi�[|n�J{i��h&�'[4&y(tb4)U��j��T\�1�\����ؾ-�Wo��?���/�!�1�>O�)>:un*���-�I�%����5�Q��}�j�J-��1N@���&�Љ��Q��P��N,b�t4�pn�ƞ��8�Q-)$f��=@|զ#S #a.AH�zV�&	*��KV�\>��P9����)E��NL���=+��:�WE��x�呂�����J�˽��A�?���Љ�i�N�,]�
��p1�#��e�l�_ ����$Ka>7BoE�Q.\e�j)���W_R(cp3�`03�Ye��b�����_���?���S�9��0N�	
�56kN���߳�����9yjkX�����I"�	��t��R�j��h�^
�<�n�
��ttЪ6b��%�c�{�p��g'�[�"'��D�n�wRKv�ݥ\�C ���b��I��)��7�H��M�����bӊ:�ڸ�0A!s;j!v�@6W�a�I�%O�_�����ߟ|c"zw_@x��̐'�ޅ�.�0C�$��o%� GR?Nggg�͏     